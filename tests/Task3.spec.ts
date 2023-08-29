import { Blockchain, SandboxContract } from '@ton-community/sandbox';
import { Builder, Cell, Slice, beginCell, toNano } from 'ton-core';
import { Task3 } from '../wrappers/Task3';
import '@ton-community/test-utils';
import { compile } from '@ton-community/blueprint';

describe('Task3', () => {
    let code: Cell;

    beforeAll(async () => {
        code = await compile('Task3');
    });

    let blockchain: Blockchain;
    let task3: SandboxContract<Task3>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        task3 = blockchain.openContract(Task3.createFromConfig({}, code));

        const deployer = await blockchain.treasury('deployer');

        const deployResult = await task3.sendDeploy(deployer.getSender(), toNano('0.05'));

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: task3.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and task3 are ready to use
    });

    function print_raw(c: Cell) {
        let s = c.beginParse();
        let out = "";
        while (s.remainingBits) {
            out += s.loadUint(1) ? '1' : '0';
        }
        if (s.remainingRefs) {
            out += print_raw(s.loadRef());
        }
        return out;
    }

    function print(c: Cell) {
        return print_raw(c).match(/.{8,8}/g)?.join("\n")
    }

    function binaryString(s: string) {
        return beginCell().storeStringTail(s).endCell();
    }

    function trickyBinaryString(s: string, limit: number): Cell {
        let b = beginCell();
        let cnt = 0;
        while (s.length > 0 && cnt < limit) {
            cnt += 1
            b.storeUint(s.charCodeAt(0), 8);
            s = s.slice(1)
        }
        if (s.length) {
            return b.storeRef(trickyBinaryString(s, limit)).endCell();
        }
        return b.endCell()
    }

    it('should do simple replace', async () => {
        let cell = binaryString("abcdef")
        console.log(cell);
        console.log(await task3.getReplace(97n, 98n, cell));
        expect(print(await task3.getReplace(97n, 98n, cell))).toBe(print(binaryString("bbcdef")))
        expect(print(await task3.getReplace(297n, 98n, cell))).toBe(print(binaryString("abcdef")))
    });

    it('should do multi-cell replace', async () => {
        let cell = binaryString("abcdef000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000");
        expect(print(await task3.getReplace(297n, 98n, cell)))
            .toBe(print(binaryString("abcdef000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000")))
        // console.log(cell)
        // console.log(await task3.getReplace(97n, 98n, cell))
        expect(print(await task3.getReplace(97n, 98n, cell)))
            .toBe(print(binaryString("bbcdef000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000")))
    });


    it('should do multi-cell replace', async () => {
        let cell = binaryString("bcdef000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000a");
        expect(print(await task3.getReplace(97n, 98n, cell)))
            .toBe(print(binaryString("bcdef000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000b")))

        cell = binaryString("abcdef000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000");
        expect(print(await task3.getReplace(BigInt(97 << 8) + 98n, BigInt(99 << 8) + 100n, cell)))
            .toBe(print(binaryString("cdcdef000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000")))

        cell = binaryString("abcdef000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000ab");
        expect(print(await task3.getReplace(BigInt(97 << 8) + 98n, BigInt(99 << 8) + 100n, cell)))
            .toBe(print(binaryString("cdcdef000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000cd")))
    });

    it('should do replace in all positions  - min', async () => {
        let cell = beginCell().storeUint(97, 8).storeRef(beginCell().storeUint(98, 8)).endCell();
        console.log(cell);
        console.log(await task3.getReplace(BigInt(97 << 8) + 98n, BigInt(99 << 8) + 100n, cell));
        expect(print_raw(await task3.getReplace(BigInt(97 << 8) + 98n, BigInt(99 << 8) + 100n, cell)))
            .toBe(print_raw(beginCell().storeUint(99, 8).storeRef(beginCell().storeUint(100, 8)).endCell()));

    });

    // it('should do replace in three cells', async () => {
    //     let cell = beginCell().storeUint(97, 8).storeRef(beginCell().storeUint(98, 8).storeRef(beginCell().storeUint(99, 8))).endCell();
    //     console.log(cell);
    //     expect(print_raw(await task3.getReplace(255n, 1n, cell)))
    //         .toBe(print_raw(cell));
    //     expect(print_raw(await task3.getReplace(BigInt(97 << 16) + BigInt(98 << 8) + 99n, 1n, cell)))
    //         .toBe(print(binaryString("1")));

    // });


    // it('should do replace in all positions', async () => {
    //     for (let i = 0; i < 200; i++) {
    //         // console.log(i)
    //         let s = "X".repeat(i) + "abcdef000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000ab";
    //         let cell = binaryString(s);
    //         // console.log(cell);
    //         expect(print(await task3.getReplace(BigInt(97 << 8) + 98n, BigInt(99 << 8) + 100n, cell)))
    //             .toBe(print(binaryString(s.replaceAll("ab", "cd"))))
    //     }

    // });

    function ones(builder: Builder, num: number): Builder {
        for (let i = 0; i < num; i++) {
            builder.storeUint(1, 1);
        }
        return builder;
    }

    it('should replace with larger size', async () => {
        let cell = ones(beginCell(), 1000).storeRef(ones(beginCell(), 1000).endCell()).endCell();
        console.log(cell);
        console.log(await task3.getReplace(1n, 7n, cell));
        expect(print_raw(await task3.getReplace(1n, 1023n, cell)))
            .toBe("1".repeat(2000 * 10));
    });


    it('should replace with smaller size', async () => {
        let cell = ones(beginCell(), 1000).storeRef(ones(beginCell(), 1000).endCell()).endCell();
        console.log(cell);
        console.log(await task3.getReplace(1n, 7n, cell));
        expect(print_raw(await task3.getReplace(15n, 1n, cell)))
            .toBe("1".repeat(500));
    });


    it('should do multi-cell replace different size', async () => {
        let cell = binaryString("abcdef000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000");

        expect(print(await task3.getReplace(97n, 25186n, cell)))
            .toBe(print(binaryString("bbbcdef000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000")))
        // expect(print(await task3.getReplace(48n, 49n, cell)))
        //     .toBe(print(binaryString("abcdef000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000".replace("0", "1"))))
        let cell_small = binaryString("abcdef000000");
        expect(print(await task3.getReplace(BigInt(48 << 8) + 48n, BigInt(49 << 8) + 49n, cell_small)))
            .toBe(print(binaryString("abcdef111111")))

        cell_small = trickyBinaryString("zabcdef000000", 5);
        console.log(cell_small)
        console.log(await task3.getReplace(
            BigInt(48 << 16) + BigInt(48 << 8) + 48n,
            BigInt(49 << 16) + BigInt(49 << 8) + 49n, cell_small))
        expect(print(await task3.getReplace(
            BigInt(48 << 16) + BigInt(48 << 8) + 48n,
            BigInt(49 << 16) + BigInt(49 << 8) + 49n, cell_small)))
            .toBe(print(binaryString("zabcdef111111")))

        let prefix = "abcdef000000";
        // for (let i = 1; i < 300; i++) {
        //     // console.log(i);
        //     let long_one = "2".repeat(i) + prefix;
        //     cell_small = binaryString(long_one);
        //     // console.log(cell_small);
        //     expect(print(await task3.getReplace(BigInt(48 << 8) + 48n, BigInt(49 << 8) + 49n, cell_small)))
        //         .toBe(print(binaryString(long_one.replaceAll("0", "1"))))
        // }
        // expect(print(await task3.getReplace(12336n, 12851n, cell_small)))
        //     .toBe(print(binaryString("abcdef000000".replace("0", "2"))))

        // let s = "abcdef0000000"
        // expect(print(await task3.getReplace(12336n, 12851n, binaryString(s))))
        //     .toBe(print(binaryString(s.replace("0", "2"))))
    });
});
