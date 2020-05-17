import * as d3 from 'd3';
import {Point2DPlus, VoronoiVisualization} from "./Visualize";
import {mat, ones, vec, Vector} from "@josh-brown/vector";
import {ModelSetRn} from "./Compute";
import 'bootstrap/dist/css/bootstrap'
import * as bs from "bootstrap"
import $ from 'jquery';

let TAU = 2*3.141592
const width = innerWidth
const height = innerHeight
const L1 = 50
const L2 = L1*height/width
// Aamann-Beenker tiling as constructed in https://arxiv.org/pdf/1906.10392.pdf
let k: number = 2;
const G = mat([0,1,2,3]
    .map(k => k * TAU/8)
    .map(theta => [Math.cos(theta), Math.sin(theta)]))
    .transpose()
const H = mat([0,3,6,9]
    .map(k => k * TAU/8)
    .map(theta => [Math.cos(theta), Math.sin(theta)]))
    .transpose()

function WG(x: Vector) : boolean {
    return [x.toArray()[0]/L1, x.toArray()[1]/L2].every(c => -1 < c && c < 1);
}
function WH(x: Vector) : boolean {
    let r = 1/(2* Math.tan(TAU/16)); // radius of octagon with unit side length
    return G.transpose().apply(x).toArray().every(c => -r < c && c < r);
}

let model_set = new ModelSetRn(k+2, G, H, WG, WH)
let points = model_set.model_set_from(vec([0,0,0,0]))

const container = d3.select("#container")

function vec_color(x : Vector<number>) : number {
    return 2 * (((x.innerProduct(vec([1,1,1,1]))%2)+2)%2);
}
let points2d: Point2DPlus[] = points
    .map(point => ({
        x: point.physical.getEntry(0),
        y: point.physical.getEntry(1),
        label: point.total.toArray().toString(),
        color: vec_color(point.total)}))

let voronoi = new VoronoiVisualization(container, {L1: L1, L2: L2, width: width, height: height}, points2d);
