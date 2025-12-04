import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Pill, CheckCircle } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "./ui/badge";

const mockPrescriptions = [
    { id: "RX001", patient: "John Carter", medication: "Lisinopril 10mg", date: "2023-10-26", status: "Filled" },
    { id: "RX002", patient: "Anna Lee", medication: "Metformin 500mg", date: "2023-10-25", status: "Pending" },
    { id: "RX003", patient: "Mike Ross", medication: "Amoxicillin 250mg", date: "2023-10-24", status: "Filled" },
];

export default function PharmacistDashboard() {
  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Pharmacist Dashboard</h1>
        <p className="text-muted-foreground">Verify and manage patient prescriptions.</p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Verify Prescription</CardTitle>
          <CardDescription>Enter a prescription ID to verify its authenticity.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-2">
            <Input placeholder="Enter Prescription ID..." />
            <Button>
                <Search className="mr-2 h-4 w-4"/> Verify
            </Button>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
            <CardTitle>Recent Prescriptions</CardTitle>
            <CardDescription>A list of recent prescriptions to be filled.</CardDescription>
        </CardHeader>
        <CardContent>
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Prescription ID</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead>Medication</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Action</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {mockPrescriptions.map(rx => (
                    <TableRow key={rx.id}>
                        <TableCell className="font-mono text-xs">{rx.id}</TableCell>
                        <TableCell className="font-medium">{rx.patient}</TableCell>
                        <TableCell>{rx.medication}</TableCell>
                        <TableCell>{rx.date}</TableCell>
                        <TableCell>
                            <Badge variant={rx.status === 'Filled' ? 'default' : 'secondary'} className={rx.status === 'Filled' ? 'bg-green-500' : ''}>
                                {rx.status}
                            </Badge>
                        </TableCell>
                        <TableCell>
                            {rx.status === 'Pending' && (
                                <Button variant="outline" size="sm">
                                    <CheckCircle className="mr-2 h-4 w-4" /> Mark as Filled
                                </Button>
                            )}
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
        </CardContent>
      </Card>

    </div>
  );
}
