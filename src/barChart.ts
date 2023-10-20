import * as d3 from "d3";
import gdpData from "./GDP-data.json";

const data = gdpData.data as [string, number][];

export function setupChart(container: HTMLDivElement) {
  // Declare the chart dimensions and margins.
  const width = 720;
  const height = 400;
  const marginTop = 20;
  const marginRight = 20;
  const marginBottom = 30;
  const marginLeft = 40;
  const barWidth = (width - marginRight - marginLeft) / data.length;

  // Declare the x (horizontal position) scale.
  const x = d3
    .scaleUtc()
    .domain([new Date(gdpData.from_date), new Date(gdpData.to_date)])
    .range([marginLeft, width - marginRight]);

  // Declare the y (vertical position) scale.
  const y = d3
    .scaleLinear()
    .domain([
      0,
      d3.max(data, (d) => {
        return d[1];
      }) as number,
    ])
    .range([height - marginBottom, marginTop]);

  // Create the SVG container.
  const svg = d3.create("svg").attr("width", width).attr("height", height);

  // Create tooltip
  const tooltip = d3
    .select("#container")
    .append("div")
    .attr("id", "tooltip")
    .style("opacity", 0)
    .attr(
      "class",
      "bg-white/90 shadow-fuchsia-950/10 font-inter rounded w-40 p-3 h-20 absolute bottom-16 left-16 shadow-lg flex items-center justify-center flex-col",
    );

  // Add the x-axis.
  svg
    .append("g")
    .attr("transform", `translate(0,${height - marginBottom})`)
    .attr("id", "x-axis")
    .call(d3.axisBottom(x));

  // Add the y-axis.
  svg
    .append("g")
    .attr("transform", `translate(${marginLeft},0)`)
    .attr("id", "y-axis")
    .call(d3.axisLeft(y));

  const quartMap = {
    "01": 1,
    "04": 2,
    "07": 3,
    "10": 4,
  } as const;
  type Month = keyof typeof quartMap;

  // Add Rect
  svg
    .selectAll("rect")
    .data(data)
    .enter()
    .append("rect")
    .attr("x", (d) => x(new Date(d[0])))
    .attr("width", barWidth)
    .attr("y", (d) => y(d[1]))
    .attr("height", (d) => height - marginBottom - y(d[1]))
    .attr("class", "bar fill-fuchsia-500 hover:fill-fuchsia-300")
    .attr("data-date", (d) => d[0])
    .attr("data-gdp", (d) => d[1])
    .on("mouseover", (_, d) => {
      tooltip.transition().duration(200).style("opacity", 0.9);
      tooltip
        .html(
          `<span class="font-bold">Q${quartMap[d[0].slice(5, 7) as Month]}
          ${d[0].slice(0, 4)}</span>
           <span>$${d[1].toLocaleString()} Billion</span>`,
        )
        .attr("data-date", d[0]);
    })
    .on("mouseout", () => {
      tooltip.transition().duration(200).style("opacity", 0);
    });

  container.append(svg.node() as Node);
}
