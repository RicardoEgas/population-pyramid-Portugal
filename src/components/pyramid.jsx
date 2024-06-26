import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

const Pyramid = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        //Fetch file from public directory
        const response = await fetch("/Portugal-2018.xlsx");
        // Convert the response to an array buffer
        const arrayBuffer = await response.arrayBuffer();
        // Read the workbook from the array buffer
        const workbook = XLSX.read(arrayBuffer, { type: "array" });
        // Get the worksheet using the first sheet
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        // Convert the worksheet data to JSON format
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        // Process the jsonData to extract the data
        setData(processData(jsonData));
      } catch (error) {
        console.error("Error reading data from Excel file:", error);
      }
    };

    fetchData();
  }, []);

  const processData = (jsonData) => {
    // obtain headers
    const headers = jsonData[0];

    // Find the index of columns containing age, male population, and female population
    const ageIndex = headers.findIndex(
      (header) => header.toLowerCase() === "age"
    );
    const maleIndex = headers.findIndex(
      (header) => header.toLowerCase() === "m"
    );
    const femaleIndex = headers.findIndex(
      (header) => header.toLowerCase() === "f"
    );

    // Extract data starting from the second row
    const processedData = jsonData.slice(1).map((row) => ({
      ageGroup: row[ageIndex],
      male: parseInt(row[maleIndex]), // Parse male population as integer
      female: parseInt(row[femaleIndex]), // Parse female population as integer
    }));

    // Calculate total population
    const totalPopulation = processedData.reduce(
      (counter, curr) => counter + curr.male + curr.female,
      0
    );

    // Calculate percentages for age groups
    const processedDataWithPercentages = processedData.map((item) => ({
      ...item,
      malePercentage: (item.male / totalPopulation) * 100,
      femalePercentage: -(item.female / totalPopulation) * 100,
    }));

    return processedDataWithPercentages;
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
      }}
    >
      <h1>Portugal 2018</h1>
      <BarChart
        width={600}
        height={300}
        data={data}
        layout="vertical"
        stackOffset="sign" /* Offset for stacked bars */
      >
        <CartesianGrid strokeDasharray="3 3" horizontal={false} />{" "}
        {/* Grid lines */}
        <XAxis
          type="number" /* X-axis type */
          domain={[-8, 8]}
          ticks={Array.from(Array(17).keys()).map((val) => val - 8)} // Generate ticks from -8 to 8
          tickFormatter={(tick) => `${Math.abs(tick)}%`} // Give absolute values to all ticks
          label={{
            value: "Percentage of population",
            position: "insideBottom",
            offset: -2,
          }} /* X-axis legend */
        />
        <YAxis
          type="category" /* Y-axis type */
          dataKey="ageGroup"
          reversed={true} /* Reverse Y-axis */
          label={{
            value: "Years",
            angle: -90,
            position: "insideLeft",
          }} /* Y-axis legend */
        />
        <Tooltip /> {/* Tooltip for displaying additional information */}
        <Legend content={() => null} />{/* Legend to be null */}
        <Bar
          dataKey="malePercentage" /* Data key for male percentage */
          stackId="a" /* Stack ID for stacking bars */
          fill="#ed7d31" /* Fill color for male percentage bar */
          barSize={20} /* Bar width */
          stroke="#000" /* Border color */
          strokeWidth={2} /* Border width */
        />
        <Bar
          dataKey="femalePercentage" /* Data key for female percentage */
          stackId="a" /* Stack ID for stacking bars */
          fill="#5b9bd5" /* Fill color for female percentage bar */
          barSize={20} /* Bar width */
          stroke="#000" /* Border color */
          strokeWidth={2} /* Border width */
        />
      </BarChart>
    </div>
  );
};

export default Pyramid;
