import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Users, ShieldCheck, UserPlus } from "lucide-react";

const mockUsers = [
  { id: "USR001", name: "Dr. Evelyn Reed", email: "evelyn.reed@clinic.com", role: "doctor", status: "active" },
  { id: "USR002", name: "John Carter", email: "john.carter@email.com", role: "patient", status: "active" },
  { id: "USR003", name: "Maria Garcia", email: "maria.g@pharma.com", role: "pharmacist", status: "active" },
  { id: "USR004", name: "Admin User", email: "admin@medseva.com", role: "admin", status: "active" },
  { id: "USR005", name: "Pending Patient", email: "pending.p@email.com", role: "patient", status: "pending" },
];


export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage users and system settings.</p>
      </header>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,257</div>
            <p className="text-xs text-muted-foreground">+20.1% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Operational</div>
            <p className="text-xs text-muted-foreground">All systems are running smoothly.</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle>User Management</CardTitle>
                <CardDescription>View, edit, or add users.</CardDescription>
            </div>
            <Button>
                <UserPlus /> Add User
            </Button>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>User ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {mockUsers.map(user => (
                        <TableRow key={user.id}>
                            <TableCell className="font-mono text-xs">{user.id}</TableCell>
                            <TableCell className="font-medium">{user.name}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell><Badge variant="secondary" className="capitalize">{user.role}</Badge></TableCell>
                            <TableCell><Badge variant={user.status === 'active' ? 'default' : 'destructive'} className="capitalize bg-green-500 text-white">{user.status}</Badge></TableCell>
                            <TableCell>
                                <Button variant="outline" size="sm">Edit</Button>
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
