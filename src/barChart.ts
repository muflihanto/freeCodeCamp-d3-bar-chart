import * as d3 from "d3";
import gdpData from "./GDP-data.json";

const tw = (strings: TemplateStringsArray, ...values: string[]) =>
  String.raw({ raw: strings }, ...values);
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

  // Declare elements classes
  const classes = {
    tooltip: tw`absolute bottom-20 left-12 flex h-20 w-40 flex-col items-center justify-center rounded bg-white/90 p-3 font-inter shadow-lg shadow-fuchsia-950/10 lg:bottom-16 lg:left-16 [&>span:first-child]:font-bold`,
    bar: tw`bar cursor-pointer fill-fuchsia-500 hover:fill-fuchsia-300 focus:fill-fuchsia-300`,
  };

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

  // Create tooltip
  const tooltip = d3
    .select("#container")
    .append("div")
    .attr("id", "tooltip")
    .style("opacity", 0)
    .attr("class", classes.tooltip);

  // Create the SVG container.
  const svg = d3
    .create("svg")
    .attr("width", width)
    .attr("height", height)
    .on("mouseout", (event: MouseEvent) => {
      if (
        document.activeElement?.classList.contains("bar") &&
        !(event.relatedTarget as HTMLElement).classList.contains("bar")
      ) {
        setTimeout(() => {
          (document.activeElement as HTMLElement | null)?.blur();
        }, 600);
        tooltip.transition().delay(500).duration(200).style("opacity", 0);
      }
    });

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
    .attr("class", classes.bar)
    .attr("tabindex", "0")
    .attr("data-date", (d) => d[0])
    .attr("data-gdp", (d) => d[1])
    .on("mouseover", (_, d) => {
      if (!document.activeElement?.classList.contains("bar")) {
        tooltip.transition().duration(200).style("opacity", 0.9);
        tooltip
          .html(
            `<span>Q${quartMap[d[0].slice(5, 7) as Month]}
            ${d[0].slice(0, 4)}</span>
             <span>$${d[1].toLocaleString()} Billion</span>`,
          )
          .attr("data-date", d[0]);
      }
    })
    .on("focus", (_, d) => {
      tooltip.transition().duration(200).style("opacity", 0.9);
      tooltip
        .html(
          `<span>Q${quartMap[d[0].slice(5, 7) as Month]}
          ${d[0].slice(0, 4)}</span>
           <span>$${d[1].toLocaleString()} Billion</span>`,
        )
        .attr("data-date", d[0]);
    })
    .on("blur", () => {
      tooltip.transition().duration(200).style("opacity", 0);
    })
    .on("mouseout", () => {
      if (!document.activeElement?.classList.contains("bar")) {
        tooltip.transition().duration(200).style("opacity", 0);
      }
    });

  container.append(svg.node() as Node);
}
