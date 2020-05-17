import {Matrix, Vector, zeros} from '@josh-brown/vector';

type VertexRecursionInfo = {in_set: false} | {in_set: true, total: Vector, neighbors: Vector[]};
type VertexOutputInfo = {
    physical: Vector,
    neighbors: Vector[],
    total: Vector,
}
export class ModelSetRn {
    private computed_vertices = new Map<string, VertexRecursionInfo>();

    constructor(
        public k: number,
        public G: Matrix,
        public H: Matrix,
        private WG: (p: Vector) => boolean,
        private WH: (p: Vector) => boolean) {
    };

    private W(p: Vector) {
        return this.WG(this.G.apply((p))) && this.WH(this.H.apply(p));
    }

    private get_vertex(x: Vector): VertexRecursionInfo | undefined{
        return this.computed_vertices.get(JSON.stringify(x.toArray()))
    }

    private set_vertex(x: Vector, info: VertexRecursionInfo){
        this.computed_vertices.set(JSON.stringify((x.toArray())), info);
    }

    private explore(p: Vector): boolean {
        let computed = this.get_vertex(p);
        if (computed == undefined) {
            if (!this.W(p)) {
                this.set_vertex(p, {in_set: false})
                return false
            } else {
                this.set_vertex(p, {in_set: true, neighbors: [], total: p})
                let neighbors: Vector[] = [];
                let builder = zeros(this.k).builder();
                for (let i = 0; i < this.k; i++) {
                    let dir = builder.elementaryVector(this.k, i);
                    if (this.explore(p.add(dir))) {
                        neighbors.push(p.add(dir));
                    }
                    if (this.explore(p.add(dir.scalarMultiply(-1)))) {
                        neighbors.push(p.add(dir.scalarMultiply(-1)));
                    }
                }
                this.set_vertex(p, {in_set: true, neighbors: neighbors, total: p})
                return true
            }
        } else {
            return computed.in_set;
        }
    }

    model_set_from(p : Vector): VertexOutputInfo[]{
        this.explore(p);
        let output = []
        for (let [vector, info] of this.computed_vertices){
            if (info.in_set) {
                output.push({
                    neighbors: info.neighbors,
                    physical: this.G.apply(info.total),
                    total: info.total
                })
            }
        }
        return output
    }
}