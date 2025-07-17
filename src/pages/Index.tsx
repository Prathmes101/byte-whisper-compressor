import { useState } from "react";
import { CompressionInterface } from "@/components/compression-interface";
import { DecompressionInterface } from "@/components/decompression-interface";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileArchive, Zap, Shield, Download, FolderOpen } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="p-3 rounded-full bg-gradient-to-r from-primary to-primary-glow">
              <FileArchive className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              HuffmanZip
            </h1>
          </div>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Advanced lossless file compression using the Huffman algorithm. 
            Compress any document or file while preserving perfect data integrity.
          </p>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card className="border-0 bg-card/50 backdrop-blur">
              <CardContent className="pt-6">
                <Zap className="h-8 w-8 text-primary mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Lightning Fast</h3>
                <p className="text-sm text-muted-foreground">
                  Optimized algorithm for rapid compression and decompression
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 bg-card/50 backdrop-blur">
              <CardContent className="pt-6">
                <Shield className="h-8 w-8 text-success mx-auto mb-3" />
                <h3 className="font-semibold mb-2">100% Lossless</h3>
                <p className="text-sm text-muted-foreground">
                  Perfect data integrity - no information lost during compression
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 bg-card/50 backdrop-blur">
              <CardContent className="pt-6">
                <Download className="h-8 w-8 text-accent mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Easy Download</h3>
                <p className="text-sm text-muted-foreground">
                  Instant download of compressed files with detailed statistics
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Interface */}
        <div className="max-w-4xl mx-auto">
          <Tabs defaultValue="compress" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="compress" className="flex items-center gap-2">
                <FileArchive className="h-4 w-4" />
                Compress Files
              </TabsTrigger>
              <TabsTrigger value="decompress" className="flex items-center gap-2">
                <FolderOpen className="h-4 w-4" />
                Decompress Files
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="compress">
              <CompressionInterface />
            </TabsContent>
            
            <TabsContent value="decompress">
              <DecompressionInterface />
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer */}
        <div className="text-center mt-16 pt-8 border-t border-border/50">
          <p className="text-sm text-muted-foreground">
            Built with the Huffman compression algorithm for optimal efficiency and reliability
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
