import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode, Tuple, TupleItem, TupleItemInt } from 'ton-core';
import { Matrix } from 'ts-matrix';


export type Task2Config = {};

export function task2ConfigToCell(config: Task2Config): Cell {
    return beginCell().endCell();
}

export class Task2 implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) { }

    static createFromAddress(address: Address) {
        return new Task2(address);
    }

    static createFromConfig(config: Task2Config, code: Cell, workchain = 0) {
        const data = task2ConfigToCell(config);
        const init = { code, data };
        return new Task2(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(),
        });
    }

    serialize(m: Matrix): TupleItem {
        let out: TupleItem[] = [];
        for (let i = 0; i < m.rows; i++) {
            let items: TupleItemInt[] = [];
            for (let j = 0; j < m.columns; j++) {
                items.push({ type: "int", value: BigInt(m.at(i, j)) })
            }
            out.push({ type: "tuple", items: items });
        }
        return { type: "tuple", items: out };
    }

    async getMatrixMult(provider: ContractProvider, a: Matrix, b: Matrix): Promise<Matrix> {

        const { stack } = await provider.get('matrix_multiplier', [this.serialize(a), this.serialize(b)])
        const res = stack.readTuple();


        let i = 0;
        let v: number[][] = []
        while (res.remaining) {
            v[i] = [];
            let row = res.readTuple();
            let j = 0;
            while (row.remaining) {
                v[i][j] = Number(row.readBigNumber());
                j++;
            }
            i++;
        }

        return new Matrix(a.rows, b.columns, v);
    }
}
