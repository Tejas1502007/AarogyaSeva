
"use client";

import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FileText, Calendar, MoreVertical, Share2, Trash2, Loader2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ShareDialog } from "../share-dialog";
import GenerateQrFromLink from "./generate-qr-from-link";
import { format } from 'date-fns';

interface Record {
  id: string;
  name: string;
  type: string;
  createdAt: {
    seconds: number;
    nanoseconds: number;
  };
}

export default function MyRecords() {
  const { user } = useAuth();
  const [records, setRecords] = useState<Record[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const recordsRef = collection(db, "records");
    // Query without ordering to avoid needing a composite index
    const q = query(recordsRef, where("ownerId", "==", user.uid));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const userRecords = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Record[];
      
      // Sort on the client-side
      userRecords.sort((a, b) => {
        const dateA = a.createdAt ? a.createdAt.seconds : 0;
        const dateB = b.createdAt ? b.createdAt.seconds : 0;
        return dateB - dateA; // For descending order
      });

      setRecords(userRecords);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching records:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);


  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">My Health Records</h1>
        <p className="text-muted-foreground">Manage, upload, and securely share your health documents.</p>
      </header>
      
      <GenerateQrFromLink />

      <Card>
        <CardHeader>
          <CardTitle>My Records Vault</CardTitle>
          <CardDescription>A list of all your uploaded and scanned health records.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Record Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Date Added</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    <div className="flex justify-center items-center p-8">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                      <span className="ml-2">Loading records...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : records.length > 0 ? (
                records.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">{record.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="flex w-fit items-center gap-1 capitalize">
                        <FileText className="h-3 w-3" />
                        {record.type.replace('-', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {record.createdAt ? format(new Date(record.createdAt.seconds * 1000), 'PPP') : 'N/A'}
                    </TableCell>
                    <TableCell className="text-right">
                      <ShareDialog>
                          <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                      <MoreVertical className="h-4 w-4" />
                                      <span className="sr-only">More actions</span>
                                  </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                  <DropdownMenuItem>
                                      <Share2 className="mr-2 h-4 w-4" /> Share
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="text-red-500 focus:text-red-500">
                                      <Trash2 className="mr-2 h-4 w-4" /> Delete
                                  </DropdownMenuItem>
                              </DropdownMenuContent>
                          </DropdownMenu>
                      </ShareDialog>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                 <TableRow>
                    <TableCell colSpan={4} className="text-center h-24">
                        No records found. Try scanning a report.
                    </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
