import "./style.css";
import { setupChart } from "./barChart.ts";

setupChart(document.querySelector<HTMLDivElement>("#container")!);
