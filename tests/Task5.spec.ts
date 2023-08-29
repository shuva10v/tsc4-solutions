import { Blockchain, SandboxContract } from '@ton-community/sandbox';
import { Cell, toNano } from 'ton-core';
import { Task5 } from '../wrappers/Task5';
import '@ton-community/test-utils';
import { compile } from '@ton-community/blueprint';

describe('Task5', () => {
    let code: Cell;

    beforeAll(async () => {
        code = await compile('Task5');
    });

    let blockchain: Blockchain;
    let task5: SandboxContract<Task5>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        task5 = blockchain.openContract(Task5.createFromConfig({}, code));

        const deployer = await blockchain.treasury('deployer');

        const deployResult = await task5.sendDeploy(deployer.getSender(), toNano('0.05'));

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: task5.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        //
    });

    it('simple one', async () => {
        const res = await task5.getFibbonacci(1n, 3n);
        console.log(res);
        expect(res).toEqual([1n, 1n, 2n]);
    });

    it('large one', async () => {
        const res = await task5.getFibbonacci(201n, 4n);
        expect(res).toEqual([
            453973694165307953197296969697410619233826n,
            734544867157818093234908902110449296423351n,
            1188518561323126046432205871807859915657177n,
            1923063428480944139667114773918309212080528n
        ]);
    });

    // it('test it all!', async () => {

    //     for (let n = 0n; n <= 370; n++) {
    //         // console.log("n = " + n);
    //         for (let k = 0n; k <= 255; k++) {
    //             console.log("n = " + n + "k = " + k);
    //             if (n + k > 370) {
    //                 continue;
    //             }
    //             const res = await task5.getFibbonacci(n, k);
    //             let expected: bigint[] = [];

    //             let prev = 1n;
    //             let current = 0n;
    //             let index = 0;
    //             while (1) {
    //                 if (index >= n) {
    //                     expected.push(current);
    //                 }
    //                 index += 1;
    //                 if (index >= k + n) {
    //                     break;
    //                 }
    //                 let tmp = current;
    //                 current = current + prev;
    //                 prev = tmp;
    //             }
    //             // console.log(res);
    //             expect(res).toEqual(expected);
    //         }
    //     }
    //     // expect(res).toEqual([
    //     //     453973694165307953197296969697410619233826n,
    //     //     734544867157818093234908902110449296423351n,
    //     //     1188518561323126046432205871807859915657177n,
    //     //     1923063428480944139667114773918309212080528n
    //     // ]);
    // });

    it('lower values', async () => {
        //     sequence from N to N+K terms (0<=N<=370; 0<=N+K<=370; 0<=K<=255).
        //     The first two terms of the Fibonacci sequence are F_0 = 0 and F_1 = 1,
        // expect(await task5.getFibbonacci(0n, 0n)).toEqual([0n]);
        // expect(await task5.getFibbonacci(3n, 0n)).toEqual([2n]);
        // expect(await task5.getFibbonacci(1n, 0n)).toEqual([1n]);
        expect(await task5.getFibbonacci(2n, 1n)).toEqual([1n]);
        expect(await task5.getFibbonacci(0n, 1n)).toEqual([0n]);
        expect(await task5.getFibbonacci(0n, 2n)).toEqual([0n, 1n]);
    });
});
