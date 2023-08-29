import { Blockchain, SandboxContract } from '@ton-community/sandbox';
import { Cell, beginCell, toNano } from 'ton-core';
import { Task4 } from '../wrappers/Task4';
import '@ton-community/test-utils';
import { compile } from '@ton-community/blueprint';

describe('Task4', () => {
    let code: Cell;

    beforeAll(async () => {
        code = await compile('Task4');
    });

    let blockchain: Blockchain;
    let task4: SandboxContract<Task4>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        task4 = blockchain.openContract(Task4.createFromConfig({}, code));

        const deployer = await blockchain.treasury('deployer');

        const deployResult = await task4.sendDeploy(deployer.getSender(), toNano('0.05'));

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: task4.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and task4 are ready to use
    });

    it('simple one', async () => {
        let cell = beginCell().storeUint(0, 32)
            .storeBuffer(Buffer.from("test"))
            .endCell();
        const enc = await task4.getEncrypt(15n, cell)
        console.log(enc);
        expect((await task4.getDecrypt(15n, enc)).beginParse().skip(32).loadStringTail()).toEqual(cell.beginParse().skip(32).loadStringTail());
    })

    it('long one', async () => {
        let cell = beginCell().storeUint(0, 32)
            .storeStringTail("testtesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttest")
            .endCell();
        console.log(cell);
        const enc = await task4.getEncrypt(15n, cell)
        console.log(enc);
        console.log((await task4.getDecrypt(15n, enc)));
        expect((await task4.getDecrypt(15n, enc)).hash()).toEqual(cell.hash());
        // expect((await task4.getDecrypt(15n, enc)).beginParse().skip(32).loadStringTail()).toEqual(cell.beginParse().skip(32).loadStringTail());
    })
});
