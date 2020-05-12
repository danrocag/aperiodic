import {Matrix, Vector, zeros} from '@josh-brown/vector';


export class ModelSetRn {
    k: number;
    G: Matrix;
    H: Matrix;
    W : (x : Vector) => boolean;
    L : number;
    bounds : number;
    lattice: Vector[] = [];


    constructor(k: number, G: Matrix, H: Matrix, W: (x: Vector) => boolean, L: number, bounds: number) {
        this.k = k;
        this.G = G;
        this.H = H;
        this.W = W;
        this.L = L;
        this.bounds = bounds;
    }

    private generate_lattice() {
        let range = Array.from(new Array(2*this.bounds+1), (x,i) => i-this.bounds-1);
        this.lattice.push(zeros(this.k+2))
        let builder = zeros(this.k+2).builder()
        console.log(range);
        for (let n = 0; n < this.k+2; n++){
            let dir = builder.elementaryVector(this.k+2, n);
            this.lattice = this.lattice
                .map(x => range.map(j => x.add(dir.scalarMultiply(j))))
                .reduce((accumulator, value) => accumulator.concat(value), []);
        }
    }

    private in_set(x : Vector): boolean{
        let physical = this.G.apply(x);
        let accept_physical = (physical.getEntry(0) < this.L) && (physical.getEntry(0) > -this.L)  && (physical.getEntry(1) < this.L) && (physical.getEntry(1) > -this.L)
        let internal = this.H.apply(x);
        let accept_internal = this.W(internal);
        return accept_physical && accept_internal;
    }

    private computePoints_big() : Vector[]{
        this.generate_lattice()
        return this.lattice.filter(x => this.in_set(x));
    }

    computePoints() : Vector[]{
        return this.computePoints_big().filter(x => this.in_set(x));
    }
}