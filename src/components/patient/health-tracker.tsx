"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Calculator, Activity, Droplets } from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Line, LineChart, CartesianGrid, XAxis, YAxis } from "recharts";

const bmiData = [
  { date: "Jan", value: 24.2 },
  { date: "Feb", value: 23.8 },
  { date: "Mar", value: 23.5 },
  { date: "Apr", value: 23.2 },
  { date: "May", value: 22.9 },
  { date: "Jun", value: 22.6 }
];

const bpData = [
  { date: "Jan", systolic: 125, diastolic: 82 },
  { date: "Feb", systolic: 122, diastolic: 80 },
  { date: "Mar", systolic: 120, diastolic: 78 },
  { date: "Apr", systolic: 118, diastolic: 76 },
  { date: "May", systolic: 115, diastolic: 75 },
  { date: "Jun", systolic: 112, diastolic: 74 }
];

const glucoseData = [
  { date: "Jan", value: 98 },
  { date: "Feb", value: 95 },
  { date: "Mar", value: 92 },
  { date: "Apr", value: 90 },
  { date: "May", value: 88 },
  { date: "Jun", value: 85 }
];

export function HealthTracker() {
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [bmi, setBmi] = useState<number | null>(null);

  const calculateBMI = () => {
    const h = parseFloat(height) / 100; // Convert cm to m
    const w = parseFloat(weight);
    if (h > 0 && w > 0) {
      const bmiValue = w / (h * h);
      setBmi(Math.round(bmiValue * 10) / 10);
    }
  };

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { category: 'Underweight', color: 'text-blue-600' };
    if (bmi < 25) return { category: 'Normal', color: 'text-green-600' };
    if (bmi < 30) return { category: 'Overweight', color: 'text-yellow-600' };
    return { category: 'Obese', color: 'text-red-600' };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Activity className="h-6 w-6 text-[#26A69A]" />
        <h2 className="text-2xl font-bold text-[#263238]">Health Tracker</h2>
      </div>

      {/* BMI Calculator */}
      <Card className="bg-gradient-to-r from-[#00BFA6]/5 to-[#9EF0E3]/5 border-[#26A69A]/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#263238]">
            <Calculator className="h-5 w-5 text-[#26A69A]" />
            BMI Calculator
          </CardTitle>
          <CardDescription>Calculate your Body Mass Index</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="height">Height (cm)</Label>
              <Input
                id="height"
                type="number"
                placeholder="170"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="border-[#26A69A]/30 focus:border-[#009688]"
              />
            </div>
            <div>
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input
                id="weight"
                type="number"
                placeholder="70"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="border-[#26A69A]/30 focus:border-[#009688]"
              />
            </div>
          </div>
          <Button onClick={calculateBMI} className="bg-[#009688] hover:bg-[#00796B]">
            Calculate BMI
          </Button>
          {bmi && (
            <div className="p-4 bg-white rounded-lg border border-[#26A69A]/20">
              <p className="text-lg font-semibold text-[#263238]">
                Your BMI: <span className="text-[#009688]">{bmi}</span>
              </p>
              <p className={`text-sm ${getBMICategory(bmi).color} font-medium`}>
                Category: {getBMICategory(bmi).category}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Health Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* BMI Trend */}
        <Card className="bg-white border-[#26A69A]/20">
          <CardHeader>
            <CardTitle className="text-[#263238] text-lg">BMI Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{ value: { label: "BMI", color: "#26A69A" } }} className="h-[200px]">
              <LineChart data={bmiData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line type="monotone" dataKey="value" stroke="#26A69A" strokeWidth={2} />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Blood Pressure */}
        <Card className="bg-white border-[#26A69A]/20">
          <CardHeader>
            <CardTitle className="text-[#263238] text-lg flex items-center gap-2">
              <Activity className="h-4 w-4 text-[#26A69A]" />
              Blood Pressure
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer 
              config={{ 
                systolic: { label: "Systolic", color: "#009688" },
                diastolic: { label: "Diastolic", color: "#26A69A" }
              }} 
              className="h-[200px]"
            >
              <LineChart data={bpData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line type="monotone" dataKey="systolic" stroke="#009688" strokeWidth={2} />
                <Line type="monotone" dataKey="diastolic" stroke="#26A69A" strokeWidth={2} />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Glucose Levels */}
        <Card className="bg-white border-[#26A69A]/20">
          <CardHeader>
            <CardTitle className="text-[#263238] text-lg flex items-center gap-2">
              <Droplets className="h-4 w-4 text-[#26A69A]" />
              Glucose Levels
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{ value: { label: "Glucose", color: "#00796B" } }} className="h-[200px]">
              <LineChart data={glucoseData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line type="monotone" dataKey="value" stroke="#00796B" strokeWidth={2} />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}