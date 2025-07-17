import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/ui/file-upload";
import { CompressionStats } from "@/components/compression-stats";
import { HuffmanVisualizer } from "@/components/huffman-visualizer";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { HuffmanCompressor, CompressionResult } from "@/lib/huffman";
import { Download, Upload, FileArchive, RotateCcw } from "lucide-react";

export function CompressionInterface() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionResult, setCompressionResult] = useState<CompressionResult | null>(null);
  const [processingTime, setProcessingTime] = useState<number | null>(null);
  const { toast } = useToast();

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setCompressionResult(null);
    setProcessingTime(null);
  };

  const handleCompress = async () => {
    if (!selectedFile) return;

    setIsCompressing(true);
    const startTime = performance.now();

    try {
      // Read file as Uint8Array
      const arrayBuffer = await selectedFile.arrayBuffer();
      const data = new Uint8Array(arrayBuffer);

      // Compress using Huffman algorithm
      const compressor = new HuffmanCompressor();
      const result = await new Promise<CompressionResult>((resolve) => {
        // Use setTimeout to prevent UI blocking
        setTimeout(() => {
          const compressed = compressor.compress(data);
          resolve(compressed);
        }, 100);
      });

      const endTime = performance.now();
      const time = (endTime - startTime) / 1000;

      setCompressionResult(result);
      setProcessingTime(time);

      toast({
        title: "Compression Complete!",
        description: `File compressed by ${result.compressionRatio.toFixed(1)}% in ${time.toFixed(2)}s`,
      });

    } catch (error) {
      console.error('Compression error:', error);
      toast({
        title: "Compression Failed",
        description: "An error occurred while compressing the file.",
        variant: "destructive",
      });
    } finally {
      setIsCompressing(false);
    }
  };

  const handleDownload = () => {
    if (!compressionResult || !selectedFile) return;

    const blob = new Blob([compressionResult.compressedData], { 
      type: 'application/octet-stream' 
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedFile.name}.hzip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Download Started",
      description: "Your compressed file is being downloaded.",
    });
  };

  const handleReset = () => {
    setSelectedFile(null);
    setCompressionResult(null);
    setProcessingTime(null);
  };

  return (
    <div className="space-y-6">
      {/* File Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload File
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FileUpload 
            onFileSelect={handleFileSelect}
            maxSize={50 * 1024 * 1024} // 50MB limit
          />
          
          {selectedFile && (
            <div className="flex gap-3 mt-4">
              <Button 
                onClick={handleCompress}
                disabled={isCompressing}
                className="flex-1"
              >
                {isCompressing ? (
                  <>
                    <FileArchive className="mr-2 h-4 w-4 animate-spin" />
                    Compressing...
                  </>
                ) : (
                  <>
                    <FileArchive className="mr-2 h-4 w-4" />
                    Compress File
                  </>
                )}
              </Button>
              
              {compressionResult && (
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
      {isCompressing && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Compressing {selectedFile?.name}</span>
                <span>Processing...</span>
              </div>
              <Progress value={undefined} className="w-full" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Section */}
      {compressionResult && (
        <>
          <CompressionStats
            originalSize={compressionResult.originalSize}
            compressedSize={compressionResult.compressedSize}
            compressionRatio={compressionResult.compressionRatio}
            processingTime={processingTime || undefined}
          />

          <HuffmanVisualizer huffmanCodes={compressionResult.huffmanCodes} />
        </>
      )}
    </div>
  );
}