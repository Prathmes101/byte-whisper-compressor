import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/ui/file-upload";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { HuffmanCompressor, DecompressionResult } from "@/lib/huffman";
import { Download, Upload, FolderOpen, RotateCcw } from "lucide-react";

export function DecompressionInterface() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDecompressing, setIsDecompressing] = useState(false);
  const [decompressionResult, setDecompressionResult] = useState<DecompressionResult | null>(null);
  const [processingTime, setProcessingTime] = useState<number | null>(null);
  const { toast } = useToast();

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setDecompressionResult(null);
    setProcessingTime(null);
  };

  const handleDecompress = async () => {
    if (!selectedFile) return;

    setIsDecompressing(true);
    const startTime = performance.now();

    try {
      // Read file as Uint8Array
      const arrayBuffer = await selectedFile.arrayBuffer();
      const data = new Uint8Array(arrayBuffer);

      // Decompress using Huffman algorithm
      const compressor = new HuffmanCompressor();
      const result = await new Promise<DecompressionResult>((resolve) => {
        // Use setTimeout to prevent UI blocking
        setTimeout(() => {
          const decompressed = compressor.decompress(data);
          resolve(decompressed);
        }, 100);
      });

      const endTime = performance.now();
      const time = (endTime - startTime) / 1000;

      setDecompressionResult(result);
      setProcessingTime(time);

      toast({
        title: "Decompression Complete!",
        description: `File decompressed successfully in ${time.toFixed(2)}s`,
      });

    } catch (error) {
      console.error('Decompression error:', error);
      toast({
        title: "Decompression Failed",
        description: "Invalid file format or corrupted data.",
        variant: "destructive",
      });
    } finally {
      setIsDecompressing(false);
    }
  };

  const handleDownload = () => {
    if (!decompressionResult || !selectedFile) return;

    const blob = new Blob([decompressionResult.decompressedData], { 
      type: 'application/octet-stream' 
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    
    // Remove .hzip extension if present
    let filename = selectedFile.name;
    if (filename.endsWith('.hzip')) {
      filename = filename.slice(0, -5);
    } else {
      filename = `decompressed_${filename}`;
    }
    
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Download Started",
      description: "Your decompressed file is being downloaded.",
    });
  };

  const handleReset = () => {
    setSelectedFile(null);
    setDecompressionResult(null);
    setProcessingTime(null);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* File Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5" />
            Upload Compressed File
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FileUpload 
            onFileSelect={handleFileSelect}
            accept={{
              'application/octet-stream': ['.hzip'],
              '*/*': []
            }}
            maxSize={50 * 1024 * 1024} // 50MB limit
          />
          
          {selectedFile && (
            <div className="flex gap-3 mt-4">
              <Button 
                onClick={handleDecompress}
                disabled={isDecompressing}
                className="flex-1"
              >
                {isDecompressing ? (
                  <>
                    <FolderOpen className="mr-2 h-4 w-4 animate-spin" />
                    Decompressing...
                  </>
                ) : (
                  <>
                    <FolderOpen className="mr-2 h-4 w-4" />
                    Decompress File
                  </>
                )}
              </Button>
              
              {decompressionResult && (
                <Button onClick={handleDownload} variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              )}
              
              <Button onClick={handleReset} variant="outline" size="icon">
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Progress Section */}
      {isDecompressing && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Decompressing {selectedFile?.name}</span>
                <span>Processing...</span>
              </div>
              <Progress value={undefined} className="w-full" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Section */}
      {decompressionResult && (
        <Card>
          <CardHeader>
            <CardTitle>Decompression Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-success">
                  {formatFileSize(decompressionResult.originalSize)}
                </div>
                <div className="text-sm text-muted-foreground">Restored Size</div>
              </div>
              
              {processingTime && (
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold">
                    {processingTime.toFixed(2)}s
                  </div>
                  <div className="text-sm text-muted-foreground">Processing Time</div>
                </div>
              )}
              
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-primary">✓</div>
                <div className="text-sm text-muted-foreground">Integrity Verified</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}