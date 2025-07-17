import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { FileArchive, TrendingDown, Zap, FileText } from "lucide-react";

interface CompressionStatsProps {
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  processingTime?: number;
}

export function CompressionStats({
  originalSize,
  compressedSize,
  compressionRatio,
  processingTime
}: CompressionStatsProps) {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const savedBytes = originalSize - compressedSize;
  const efficiencyColor = compressionRatio > 30 ? "text-success" : 
                         compressionRatio > 10 ? "text-primary" : "text-muted-foreground";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Original Size</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatFileSize(originalSize)}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Compressed Size</CardTitle>
          <FileArchive className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-primary">{formatFileSize(compressedSize)}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Space Saved</CardTitle>
          <TrendingDown className="h-4 w-4 text-success" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${efficiencyColor}`}>
            {compressionRatio.toFixed(1)}%
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {formatFileSize(savedBytes)} saved
          </p>
          <Progress value={compressionRatio} className="mt-2" />
        </CardContent>
      </Card>

      {processingTime && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processing Time</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{processingTime.toFixed(2)}s</div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}