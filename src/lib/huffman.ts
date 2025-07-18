/**
 * Huffman Compression Algorithm Implementation
 * Translated from the C++ implementation to TypeScript
 */

export interface HuffmanNode {
  character?: number;
  count: number;
  left?: HuffmanNode;
  right?: HuffmanNode;
}

export interface CompressionResult {
  compressedData: Uint8Array;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  huffmanCodes: Map<number, string>;
  header: Uint8Array;
}

export interface DecompressionResult {
  decompressedData: Uint8Array;
  originalSize: number;
}

export class HuffmanCompressor {
  private huffmanCodes: Map<number, string> = new Map();

  /**
   * Parse file content and count character frequencies
   */
  private parseFrequencies(data: Uint8Array): Map<number, number> {
    const frequencies = new Map<number, number>();
    
    for (let i = 0; i < data.length; i++) {
      const byte = data[i];
      frequencies.set(byte, (frequencies.get(byte) || 0) + 1);
    }
    
    return frequencies;
  }

  /**
   * Create Huffman node
   */
  private createNode(character?: number, count: number = 0): HuffmanNode {
    return { character, count };
  }

  /**
   * Combine two nodes into a parent node
   */
  private combine(a: HuffmanNode, b: HuffmanNode): HuffmanNode {
    const parent = this.createNode(undefined, a.count + b.count);
    parent.left = b;
    parent.right = a;
    return parent;
  }

  /**
   * Generate Huffman tree from frequency map
   */
  private generateHuffmanTree(frequencies: Map<number, number>): HuffmanNode {
    const nodes: HuffmanNode[] = [];
    
    // Create leaf nodes for each character
    for (const [character, count] of frequencies) {
      nodes.push(this.createNode(character, count));
    }
    
    // Sort by count (ascending)
    nodes.sort((a, b) => a.count - b.count);
    
    // Handle single character case
    if (nodes.length === 1) {
      return this.combine(nodes[0], this.createNode(undefined, 0));
    }
    
    // Build tree bottom-up
    while (nodes.length > 1) {
      const left = nodes.shift()!;
      const right = nodes.shift()!;
      const parent = this.combine(right, left);
      
      // Insert parent in sorted order
      let insertIndex = 0;
      while (insertIndex < nodes.length && nodes[insertIndex].count < parent.count) {
        insertIndex++;
      }
      nodes.splice(insertIndex, 0, parent);
    }
    
    return nodes[0];
  }

  /**
   * Generate Huffman codes from tree
   */
  private generateCodes(root: HuffmanNode, code: string = ""): void {
    if (!root) return;
    
    // Leaf node - store the code
    if (root.character !== undefined) {
      this.huffmanCodes.set(root.character, code || "0"); // Single character gets "0"
      return;
    }
    
    // Traverse left with "0", right with "1"
    if (root.left) {
      this.generateCodes(root.left, code + "0");
    }
    if (root.right) {
      this.generateCodes(root.right, code + "1");
    }
  }

  /**
   * Generate header containing Huffman codes
   */
  private generateHeader(padding: number): Uint8Array {
    const headerParts: number[] = [];
    
    // Number of unique characters (0-255 represents 1-256)
    headerParts.push(this.huffmanCodes.size - 1);
    
    // For each character: character byte + code length + code
    for (const [character, code] of this.huffmanCodes) {
      headerParts.push(character);
      headerParts.push(code.length);
      
      // Convert code string to bytes
      for (let i = 0; i < code.length; i++) {
        headerParts.push(code.charCodeAt(i));
      }
    }
    
    // Add padding info
    headerParts.push(padding);
    
    return new Uint8Array(headerParts);
  }

  /**
   * Compress data using Huffman algorithm
   */
  public compress(data: Uint8Array): CompressionResult {
    if (data.length === 0) {
      throw new Error("Cannot compress empty data");
    }

    // Reset codes
    this.huffmanCodes.clear();
    
    // Step 1: Count frequencies
    const frequencies = this.parseFrequencies(data);
    
    // Step 2: Build Huffman tree
    const root = this.generateHuffmanTree(frequencies);
    
    // Step 3: Generate codes
    this.generateCodes(root);
    
    // Step 4: Calculate compressed size in bits
    let totalBits = 0;
    for (let i = 0; i < data.length; i++) {
      const code = this.huffmanCodes.get(data[i])!;
      totalBits += code.length;
    }
    
    const padding = (8 - (totalBits % 8)) % 8;
    const compressedBytes = Math.ceil(totalBits / 8);
    
    // Step 5: Generate header
    const header = this.generateHeader(padding);
    
    // Step 6: Compress data
    const compressed = new Uint8Array(compressedBytes);
    let bitPosition = 0;
    let currentByte = 0;
    let byteIndex = 0;
    
    for (let i = 0; i < data.length; i++) {
      const code = this.huffmanCodes.get(data[i])!;
      
      for (let j = 0; j < code.length; j++) {
        const bit = code[j] === '1' ? 1 : 0;
        currentByte |= (bit << (7 - bitPosition));
        bitPosition++;
        
        if (bitPosition === 8) {
          compressed[byteIndex] = currentByte;
          byteIndex++;
          currentByte = 0;
          bitPosition = 0;
        }
      }
    }
    
    // Write final byte if needed
    if (bitPosition > 0) {
      compressed[byteIndex] = currentByte;
    }
    
    // Combine header and compressed data
    const result = new Uint8Array(header.length + compressed.length);
    result.set(header, 0);
    result.set(compressed, header.length);
    
    return {
      compressedData: result,
      originalSize: data.length,
      compressedSize: result.length,
      compressionRatio: (1 - result.length / data.length) * 100,
      huffmanCodes: new Map(this.huffmanCodes),
      header
    };
  }

  /**
   * Decompress Huffman-compressed data
   */
  public decompress(compressedData: Uint8Array): DecompressionResult {
    if (compressedData.length === 0) {
      throw new Error("Cannot decompress empty data");
    }

    let offset = 0;
    
    // Read header
    const uniqueCharCount = compressedData[offset] + 1;
    offset++;
    
    // Rebuild Huffman tree
    const root: HuffmanNode = { count: 0 };
    
    for (let i = 0; i < uniqueCharCount; i++) {
      const character = compressedData[offset++];
      const codeLength = compressedData[offset++];
      
      // Read code
      let code = "";
      for (let j = 0; j < codeLength; j++) {
        code += String.fromCharCode(compressedData[offset++]);
      }
      
      // Build tree path for this character
      let current = root;
      for (let j = 0; j < code.length; j++) {
        if (code[j] === '0') {
          if (!current.left) {
            current.left = { count: 0 };
          }
          current = current.left;
        } else {
          if (!current.right) {
            current.right = { count: 0 };
          }
          current = current.right;
        }
      }
      current.character = character;
    }
    
    // Read padding
    const padding = compressedData[offset++];
    
    // Decompress data
    const decompressed: number[] = [];
    const compressedPayload = compressedData.slice(offset);
    
    let current = root;
    let bitCount = 0;
    
    for (let i = 0; i < compressedPayload.length; i++) {
      const byte = compressedPayload[i];
      
      for (let bit = 7; bit >= 0; bit--) {
        // Skip padding bits in last byte
        if (i === compressedPayload.length - 1 && bitCount >= (8 - padding)) {
          break;
        }
        
        const bitValue = (byte >> bit) & 1;
        current = bitValue === 0 ? current.left! : current.right!;
        
        if (current.character !== undefined) {
          decompressed.push(current.character);
          current = root;
        }
        
        bitCount++;
      }
      bitCount = 0;
    }
    
    return {
      decompressedData: new Uint8Array(decompressed),
      originalSize: decompressed.length
    };
  }
}