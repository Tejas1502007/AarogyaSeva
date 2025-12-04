import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Copy, QrCode } from "lucide-react";

export function ShareDialog({ children }: { children: React.ReactNode }) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Record</DialogTitle>
          <DialogDescription>
            Generate a secure, time-limited link to share this record.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center space-y-4">
            <div className="rounded-lg border p-4 bg-white">
                <Image
                    src="https://placehold.co/200x200.png"
                    alt="QR Code"
                    width={200}
                    height={200}
                    data-ai-hint="qr code"
                />
            </div>
            <p className="text-sm text-muted-foreground">Or copy the link below</p>
            <div className="flex w-full items-center space-x-2">
                <div className="grid flex-1 gap-2">
                    <Label htmlFor="link" className="sr-only">
                        Link
                    </Label>
                    <Input
                    id="link"
                    defaultValue="https://secureseva.dev/s/rec_aB3xZ9pL"
                    readOnly
                    />
                </div>
                <Button type="submit" size="sm" className="px-3">
                    <span className="sr-only">Copy</span>
                    <Copy className="h-4 w-4" />
                </Button>
            </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="secondary">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
