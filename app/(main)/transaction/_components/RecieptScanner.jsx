"use client";

import { scanReceipt } from "@/actions/transaction";
import { Button } from "@/components/ui/button";
import useFetch from "@/hooks/useFetch";
import { Camera, LoaderCircle } from "lucide-react";
import React, { useEffect, useRef } from "react";
import { toast } from "sonner";

function RecieptScanner({ onScanComplete }) {
  const fileInputRef = useRef();

  const {
    data: scannedData,
    loading: scanRecieptLoading,
    fn: scanReceiptFn,
  } = useFetch(scanReceipt);

  const handleRecieptScan = async (file) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size exceeds 5MB limit. Please upload a smaller file.");
      return;
    }

    await scanReceiptFn(file);
  };

  useEffect(() => {
    if (scannedData && !scanRecieptLoading) {
      onScanComplete(scannedData);
      toast.success("Reciept scanned successfully!");
    }
  }, [scannedData, scanRecieptLoading]);

  return (
    <div>
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        capture="environment"
        onChange={(e) => {
          const file = e.target.files[0];
          if (file) {
            handleRecieptScan(file);
          }
        }}
      />
      <Button
        type="button"
        className={
          "w-full h-10 bg-gradient-to-br from-blue-500 cursor-pointer to-blue-600 text-white hover:from-blue-600 hover:to-blue-700"
        }
        disabled={scanRecieptLoading}
        onClick={() => {
          fileInputRef.current?.click();
        }}
      >
        {scanRecieptLoading ? (
          <div className="flex items-center justify-center gap-2">
            <LoaderCircle className="w-4 h-4 animate-spin" />
            <span>Scanning Receipt...</span>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2">
            <Camera className="w-4 h-4" />
            <span>Scan Receipt With AI</span>
          </div>
        )}
      </Button>
    </div>
  );
}

export default RecieptScanner;
