import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogTrigger,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";
import {
  Coins,
  TrendingUp,
  Shield,
  Calculator,
  Info,
  Moon,
  Sun,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
} from "lucide-react";

const BlockchainPortfolioRiskAnalyzer = () => {
  const [assets, setAssets] = useState([
    { symbol: "BTC", allocation: 40, volatility: 50, price: 50000 },
    { symbol: "ETH", allocation: 30, volatility: 40, price: 3000 },
    { symbol: "USDC", allocation: 30, volatility: 5, price: 1 },
  ]);

  const [theme, setTheme] = useState("dark");
  const [activeView, setActiveView] = useState("portfolio");
  const [simulationResults, setSimulationResults] = useState([]);
  const [totalPortfolioValue, setTotalPortfolioValue] = useState(10000);

  // Theme colors
  const themeColors = {
    light: {
      background: "bg-gray-50",
      cardBackground: "bg-white",
      text: "text-black",
      secondaryText: "text-gray-600",
      inputBackground: "bg-gray-100",
    },
    dark: {
      background: "bg-gray-900",
      cardBackground: "bg-gray-800",
      text: "text-white",
      secondaryText: "text-gray-300",
      inputBackground: "bg-gray-700",
    },
  };

  // Simulate portfolio performance
  const simulatePortfolioPerformance = () => {
    const simulations = [];
    const iterations = 100;

    for (let i = 0; i < iterations; i++) {
      let portfolioValue = totalPortfolioValue;
      const simulatedAssets = assets.map((asset) => {
        // Simulate price movement with volatility
        const priceChange =
          (Math.random() * asset.volatility * 2 - asset.volatility) / 100;
        const newPrice = asset.price * (1 + priceChange);
        const assetValue = (asset.allocation / 100) * portfolioValue;

        return {
          symbol: asset.symbol,
          originalPrice: asset.price,
          newPrice: newPrice,
          priceChange: priceChange * 100,
          assetValue: assetValue * (newPrice / asset.price),
        };
      });

      simulations.push({
        iteration: i + 1,
        assets: simulatedAssets,
        totalValue: simulatedAssets.reduce(
          (sum, asset) => sum + asset.assetValue,
          0
        ),
      });
    }

    setSimulationResults(simulations);
    // Automatically navigate to results view
    setActiveView("results");
  };

  // Calculate portfolio statistics
  const calculatePortfolioStats = () => {
    if (simulationResults.length === 0) return null;

    const values = simulationResults.map((sim) => sim.totalValue);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance =
      values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
    const stdDeviation = Math.sqrt(variance);

    return {
      meanValue: mean,
      standardDeviation: stdDeviation,
      valueAtRisk: mean - 1.96 * stdDeviation, // 95% confidence interval
      sharpeRatio: mean / stdDeviation,
    };
  };

  // Render portfolio composition view
  const renderPortfolioView = () => {
    const colors = themeColors[theme];
    return (
      <div className={`p-4 space-y-4 ${colors.text}`}>
        <div className="space-y-2">
          <div
            className={`flex items-center ${colors.inputBackground} p-3 rounded-lg`}
          >
            <Coins className="mr-2 text-blue-500" />
            <span className="flex-grow">Total Portfolio Value</span>
            <input
              type="number"
              value={totalPortfolioValue}
              onChange={(e) => setTotalPortfolioValue(Number(e.target.value))}
              className={`w-1/3 bg-transparent text-right ${colors.text}`}
            />
          </div>
        </div>

        {assets.map((asset, index) => (
          <div key={asset.symbol} className="space-y-2">
            <div
              className={`flex items-center ${colors.inputBackground} p-3 rounded-lg`}
            >
              <span className="flex-grow">{asset.symbol} Allocation</span>
              <input
                type="range"
                min="0"
                max="100"
                value={asset.allocation}
                onChange={(e) => {
                  const newAssets = [...assets];
                  newAssets[index].allocation = Number(e.target.value);
                  setAssets(newAssets);
                }}
                className="w-1/2 mr-2"
              />
              <span>{asset.allocation}%</span>
            </div>
            <div
              className={`flex items-center ${colors.inputBackground} p-3 rounded-lg`}
            >
              <span className="flex-grow">{asset.symbol} Volatility</span>
              <input
                type="range"
                min="0"
                max="100"
                value={asset.volatility}
                onChange={(e) => {
                  const newAssets = [...assets];
                  newAssets[index].volatility = Number(e.target.value);
                  setAssets(newAssets);
                }}
                className="w-1/2 mr-2"
              />
              <span>{asset.volatility}%</span>
            </div>
          </div>
        ))}

        <button
          onClick={simulatePortfolioPerformance}
          className="w-full bg-blue-500 text-white p-3 rounded-lg"
        >
          Simulate Portfolio Performance
        </button>
      </div>
    );
  };

  // Render results view with charts
  const renderResultsView = () => {
    const colors = themeColors[theme];
    const portfolioStats = calculatePortfolioStats();

    // Prepare data for pie chart
    const allocationData = assets.map((asset) => ({
      name: asset.symbol,
      value: (asset.allocation / 100) * totalPortfolioValue,
    }));

    // Prepare data for bar chart of price changes
    const priceChangeData =
      simulationResults[0]?.assets.map((asset) => ({
        symbol: asset.symbol,
        priceChange: asset.priceChange,
      })) || [];

    // Color palette for charts
    const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

    return (
      <div className={`p-4 space-y-4 ${colors.text}`}>
        {portfolioStats && (
          <div className="grid grid-cols-2 gap-2">
            <div
              className={`p-3 rounded-lg ${colors.inputBackground} text-center`}
            >
              <h4 className={`text-sm ${colors.secondaryText}`}>Mean Value</h4>
              <p className="font-bold">
                ${portfolioStats.meanValue.toFixed(2)}
              </p>
            </div>
            <div
              className={`p-3 rounded-lg ${colors.inputBackground} text-center`}
            >
              <h4 className={`text-sm ${colors.secondaryText}`}>
                Sharpe Ratio
              </h4>
              <p className="font-bold">
                {portfolioStats.sharpeRatio.toFixed(2)}
              </p>
            </div>
          </div>
        )}

        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={allocationData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) =>
                `${name} ${(percent * 100).toFixed(0)}%`
              }
            >
              {allocationData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>

        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={priceChangeData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="symbol" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="priceChange" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>

        <AlertDialog>
          <AlertDialogTrigger className="w-full bg-blue-500 text-white p-3 rounded-lg flex items-center justify-center">
            <Info className="mr-2" /> Detailed Simulation
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Simulation Details</AlertDialogTitle>
              <AlertDialogDescription>
                Comprehensive portfolio simulation results
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="max-h-[400px] overflow-y-auto">
              {simulationResults.slice(0, 10).map((sim, index) => (
                <div
                  key={index}
                  className={`${colors.inputBackground} p-2 mb-2 rounded`}
                >
                  <p>Simulation {index + 1}</p>
                  <p>Total Value: ${sim.totalValue.toFixed(2)}</p>
                  {sim.assets.map((asset) => (
                    <p key={asset.symbol}>
                      {asset.symbol}: ${asset.assetValue.toFixed(2)}(
                      {asset.priceChange.toFixed(2)}%)
                    </p>
                  ))}
                </div>
              ))}
            </div>
            <AlertDialogCancel>Close</AlertDialogCancel>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  };

  // Theme toggle
  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const colors = themeColors[theme];

  return (
    <div
      className={`min-h-screen ${themeColors[theme].background} flex flex-col`}
    >
      <div
        className={`fixed top-0 left-0 right-0 p-4 flex justify-between items-center ${themeColors[theme].cardBackground} shadow-md`}
      >
        <h1
          className={`text-xl font-bold ${themeColors[theme].text} flex items-center`}
        >
          <Shield className="mr-2 text-blue-500" />
          Portfolio Risk Analyzer
        </h1>
        <button
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          className={`p-2 rounded-full ${themeColors[theme].inputBackground}`}
        >
          {theme === "light" ? (
            <Moon className={themeColors[theme].text} />
          ) : (
            <Sun className={themeColors[theme].text} />
          )}
        </button>
      </div>

      {/* Main content with scrollable area */}
      <div className="flex-grow overflow-auto pb-20 mt-20">
        <Card className={`m-4 ${themeColors[theme].cardBackground}`}>
          <CardContent className="p-0">
            {activeView === "portfolio"
              ? renderPortfolioView()
              : renderResultsView()}
          </CardContent>
        </Card>
      </div>

      {/* Sticky bottom navigation */}
      <div
        className={`fixed bottom-0 left-0 right-0 p-4 flex justify-around ${themeColors[theme].cardBackground} shadow-md z-50`}
      >
        <button
          onClick={() => setActiveView("portfolio")}
          className={`flex flex-col items-center ${
            activeView === "portfolio"
              ? "text-blue-500"
              : themeColors[theme].secondaryText
          }`}
        >
          <Calculator />
          <span className="text-xs mt-1">Portfolio</span>
        </button>
        <button
          onClick={() => setActiveView("results")}
          className={`flex flex-col items-center ${
            activeView === "results"
              ? "text-blue-500"
              : themeColors[theme].secondaryText
          }`}
          disabled={simulationResults.length === 0}
        >
          <BarChartIcon />
          <span className="text-xs mt-1">Results</span>
        </button>
      </div>
    </div>
  );
};

export default BlockchainPortfolioRiskAnalyzer;
