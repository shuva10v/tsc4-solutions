import { Blockchain, SandboxContract } from '@ton-community/sandbox';
import { Builder, Cell, beginCell, toNano } from 'ton-core';
import { Task1 } from '../wrappers/Task1';
import '@ton-community/test-utils';
import { compile } from '@ton-community/blueprint';

describe('Task1', () => {
    let code: Cell;

    beforeAll(async () => {
        code = await compile('Task1');
    });

    let blockchain: Blockchain;
    let task1: SandboxContract<Task1>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        task1 = blockchain.openContract(Task1.createFromConfig({}, code));

        const deployer = await blockchain.treasury('deployer');

        const deployResult = await task1.sendDeploy(deployer.getSender(), toNano('0.05'));

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: task1.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and task1 are ready to use
    });

    function hash(cell: Cell) {
        const bufferAsHexString = cell.hash().toString("hex");
        return BigInt(`0x${bufferAsHexString}`);
    }

    it('should find root cell', async () => {
        let cell = beginCell().storeUint(21, 32).endCell();
        expect((await task1.getFindBranch(hash(cell), cell)).hash()).toEqual(cell.hash());
    })


    it('should return empty cell', async () => {
        let cell = beginCell().storeUint(21, 32).endCell();
        expect((await task1.getFindBranch(123n, cell))).toEqualCell(beginCell().endCell());
    })

    it('should find chuld cell', async () => {
        let cell = beginCell().storeUint(21, 32).endCell();
        let parent = beginCell().storeUint(21, 32).storeRef(cell).endCell();
        expect((await task1.getFindBranch(hash(cell), parent)).hash()).toEqual(cell.hash());
    })
});
