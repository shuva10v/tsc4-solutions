import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode } from 'ton-core';

export type Task4Config = {};

export function task4ConfigToCell(config: Task4Config): Cell {
    return beginCell().endCell();
}

export class Task4 implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) { }

    static createFromAddress(address: Address) {
        return new Task4(address);
    }

    static createFromConfig(config: Task4Config, code: Cell, workchain = 0) {
        const data = task4ConfigToCell(config);
        const init = { code, data };
        return new Task4(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(),
        });
    }

    async getEncrypt(provider: ContractProvider, shift: bigint, cell: Cell): Promise<Cell> {
        const { stack } = await provider.get('caesar_cipher_encrypt', [{ type: 'int', value: shift }, { type: 'cell', cell: cell }])
        // const t = stack.readTuple();
        // // console.log(stack);
        // let index = 0;
        // let out = "";
        // while (t.remaining) {
        //     out += "i=" + index + ": " + t.readNumber() + "\n";
        //     index += 1;
        // }
        // console.log(out);
        return stack.readCell();
    }

    async getDecrypt(provider: ContractProvider, shift: bigint, cell: Cell): Promise<Cell> {
        const { stack } = await provider.get('caesar_cipher_decrypt', [{ type: 'int', value: shift }, { type: 'cell', cell: cell }])
        return stack.readCell();
    }
}
