import { Blockchain, SandboxContract } from '@ton-community/sandbox';
import { Cell, toNano } from 'ton-core';
import { Task2 } from '../wrappers/Task2';
import '@ton-community/test-utils';
import { compile } from '@ton-community/blueprint';
import { Matrix } from 'ts-matrix';

describe('Task2', () => {
    let code: Cell;

    beforeAll(async () => {
        code = await compile('Task2');
    });

    let blockchain: Blockchain;
    let task2: SandboxContract<Task2>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        task2 = blockchain.openContract(Task2.createFromConfig({}, code));

        const deployer = await blockchain.treasury('deployer');

        const deployResult = await task2.sendDeploy(deployer.getSender(), toNano('0.05'));

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: task2.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and task2 are ready to use
    });

    it('mult simple matrixes', async () => {
        let a = new Matrix(2, 2, [[1, 2], [3, 4]])
        let b = new Matrix(2, 2, [[1, 2], [3, 4]])
        expect(await task2.getMatrixMult(a, b)).toStrictEqual(a.multiply(b))

    });

    it('mult not simple matrixes', async () => {
        let a = new Matrix(2, 3, [[1, 2, 3], [3, 4, 5]])
        let b = new Matrix(3, 2, [[1, 2], [3, 4], [6, 7]])
        expect(await task2.getMatrixMult(a, b)).toStrictEqual(a.multiply(b))

    });
});