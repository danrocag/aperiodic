import * as d3 from 'd3';
import {Delaunay} from "d3-delaunay";

export function displayVoronoi(container: any, points: {x: number, y: number, label: string}[], L: number) {
    const svg = container
        .append("svg")
        .attr("viewBox", [-L*0.9, -L*0.9, 2*L*0.9, 2*L*0.9])
        .attr("width", 800)
        .attr("height", 800)

    let voronoi = Delaunay
        .from(points, d => d.x, d => d.y)
        .voronoi([-L*0.9, -L*0.9, L*0.9, L*0.9]);

    const cell = svg.append("g")
        .attr("fill", "none")
        .selectAll("path")
        .data(points)
        .join("path")
        .attr("d", (d, i) => voronoi.renderCell(i))
        .attr("fill", (d, i) => d3.schemeCategory10[i % 7])

    const mesh = svg.append("path")
        .attr("fill", "none")
        .attr("stroke", "black")
        .attr("stroke-width", 0.01)
        .attr("d", voronoi.render());

    const circle = svg.append("g")
        .selectAll("circle")
        .data(points)
        .join("circle")
        .attr("cx", d => d.x)
        .attr("cy", d => d.y)
        .attr("r", 0.1)
        .append("svg:title")
        .text(d => d.label);
}

export function displayDelaunay(container, points: {x: number, y: number, label: string}[], L: number) {

    const svg = container
        .append("svg")
        .attr("viewBox", [-L*0.9, -L*0.9, 2*L*0.9, 2*L*0.9])
        .attr("width", 800)
        .attr("height", 800)

    let delaunay = Delaunay
        .from(points, d => d.x, d => d.y)

    const triangles = svg.append("g")
        .attr("fill", "none")
        .selectAll("path")
        .data(delaunay.triangles)
        .join("path")
        .attr("d", (d, i) => delaunay.renderTriangle(i))
        .attr("fill", (d, i) => d3.schemeCategory10[i % 4])

    const mesh = svg.append("path")
        .attr("fill", "none")
        .attr("stroke", "black")
        .attr("stroke-width", 0.05)
        .attr("d", delaunay.render());

    const circle = svg.append("g")
        .selectAll("circle")
        .data(points)
        .join("circle")
        .attr("cx", d => d.x)
        .attr("cy", d => d.y)
        .attr("r", 0.1)
        .append("svg:title")
        .text(d => d.label);
}