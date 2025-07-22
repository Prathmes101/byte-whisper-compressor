/**
 * Huffman Compression Algorithm Implementation
 * Using Min Heap data structure for optimal tree construction
 */

export interface HuffmanNode {
  character?: number;
  freq: number;
  l?: HuffmanNode;
  r?: HuffmanNode;
}

class Node {
  constructor(public character: number | undefined, public freq: number) {
    this.character = character;
    this.freq = freq;
    this.l = null;
    this.r = null;
  }
  
  l: HuffmanNode | null = null;
  r: HuffmanNode | null = null;
}

class Min_Heap {
  constructor(public size: number) {
    this.size = size;
    this.array = Array(size).fill(null);
  }
  
  array: HuffmanNode[];
}

export interface CompressionResult {
  compressedData: Uint8Array;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  huffmanCodes: Map<number, string>;
  header: Uint8Array;
  readableCompressed: string; // Human-readable compressed text
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
  private createNode(character?: number, freq: number = 0): HuffmanNode {
    return { character, freq };
  }

  /**
   * Heapify function for min heap
   */
  private Heapify(minHeap: Min_Heap, idx: number): void {
    let smallest = idx;
    const left = 2 * idx + 1;
    const right = 2 * idx + 2;

    if (left < minHeap.size && minHeap.array[left].freq < minHeap.array[smallest].freq) {
      smallest = left;
    }

    if (right < minHeap.size && minHeap.array[right].freq < minHeap.array[smallest].freq) {
      smallest = right;
    }

    if (smallest !== idx) {
      [minHeap.array[smallest], minHeap.array[idx]] = [minHeap.array[idx], minHeap.array[smallest]];
      this.Heapify(minHeap, smallest);
    }
  }

  /**
   * Extract minimum node from heap
   */
  private extractMin(minHeap: Min_Heap): HuffmanNode {
    const temp = minHeap.array[0];
    minHeap.array[0] = minHeap.array[minHeap.size - 1];
    --minHeap.size;
    this.Heapify(minHeap, 0);
    return temp;
  }

  /**
   * Insert node into heap
   */
  private insertMinHeap(minHeap: Min_Heap, node: HuffmanNode): void {
    ++minHeap.size;
    let i = minHeap.size - 1;

    while (i && node.freq < minHeap.array[Math.floor((i - 1) / 2)].freq) {
      minHeap.array[i] = minHeap.array[Math.floor((i - 1) / 2)];
      i = Math.floor((i - 1) / 2);
    }

    minHeap.array[i] = node;
  }

  /**
   * Create and build min heap
   */
  private createAndBuildMin_Heap(arr: number[], freq: number[], unique_size: number): Min_Heap {
    const minHeap = new Min_Heap(unique_size);

    for (let i = 0; i < unique_size; i++) {
      minHeap.array[i] = new Node(arr[i], freq[i]);
    }

    const n = minHeap.size - 1;
    for (let i = Math.floor((n - 1) / 2); i >= 0; i--) {
      this.Heapify(minHeap, i);
    }

    return minHeap;
  }

  /**
   * Generate Huffman tree using min heap
   */
  private generateHuffmanTree(frequencies: Map<number, number>): HuffmanNode {
    const chars: number[] = [];
    const freqs: number[] = [];
    
    // Convert frequency map to arrays
    for (const [character, freq] of frequencies) {
      chars.push(character);
      freqs.push(freq);
    }

    const unique_size = chars.length;

    // Handle single character case
    if (unique_size === 1) {
      const root = this.createNode(undefined, freqs[0]);
      root.l = this.createNode(chars[0], freqs[0]);
      return root;
    }

    // Create and build min heap
    const minHeap = this.createAndBuildMin_Heap(chars, freqs, unique_size);

    // Build Huffman tree
    while (minHeap.size > 1) {
      const left = this.extractMin(minHeap);
      const right = this.extractMin(minHeap);

      const merged = this.createNode(undefined, left.freq + right.freq);
      merged.l = left;
      merged.r = right;

      this.insertMinHeap(minHeap, merged);
    }

    return this.extractMin(minHeap);
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
    if (root.l) {
      this.generateCodes(root.l, code + "0");
    }
    if (root.r) {
      this.generateCodes(root.r, code + "1");
    }
  }

  /**
   * Generate header containing Huffman codes (simple format)
   */
  private generateHeader(padding: number, originalSize: number): Uint8Array {
    const headerParts: number[] = [];
    
    // Header marker (2 bytes: 0xHF, 0xFM)
    headerParts.push(0x48, 0x46); // "HF" marker
    
    // Original file size (4 bytes)
    headerParts.push((originalSize >>> 24) & 0xFF);
    headerParts.push((originalSize >>> 16) & 0xFF);
    headerParts.push((originalSize >>> 8) & 0xFF);
    headerParts.push(originalSize & 0xFF);
    
    // Number of unique characters (2 bytes for larger files)
    const codeCount = this.huffmanCodes.size;
    headerParts.push((codeCount >>> 8) & 0xFF);
    headerParts.push(codeCount & 0xFF);
    
    // Store codes in simple format: char(1) + length(1) + code_bits
    for (const [character, code] of this.huffmanCodes) {
      headerParts.push(character);
      headerParts.push(code.length);
      
      // Store code as bytes (8 bits per byte)
      for (let i = 0; i < code.length; i += 8) {
        let byte = 0;
        for (let j = 0; j < 8 && i + j < code.length; j++) {
          if (code[i + j] === '1') {
            byte |= (1 << (7 - j));
          }
        }
        headerParts.push(byte);
      }
    }
    
    // Padding bits (1 byte)
    headerParts.push(padding);
    
    return new Uint8Array(headerParts);
  }

  /**
   * Generate human-readable compressed text
   */
  private generateReadableCompressed(data: Uint8Array): string {
    // Convert original text to string for readable output
    const originalText = new TextDecoder('utf-8').decode(data);
    
    // Create a readable representation showing the compression mapping
    let readable = "=== HUFFMAN COMPRESSED FILE ===\n\n";
    readable += `Original Size: ${data.length} bytes\n`;
    readable += `Compression Codes:\n`;
    
    // Show the character to code mapping
    const sortedCodes = Array.from(this.huffmanCodes.entries())
      .sort((a, b) => a[1].length - b[1].length);
    
    for (const [charCode, huffmanCode] of sortedCodes) {
      const char = String.fromCharCode(charCode);
      const displayChar = char === '\n' ? '\\n' : 
                         char === '\r' ? '\\r' : 
                         char === '\t' ? '\\t' : 
                         char === ' ' ? 'SPACE' : 
                         char.charCodeAt(0) < 32 || char.charCodeAt(0) > 126 ? `[${charCode}]` : char;
      readable += `  "${displayChar}" -> ${huffmanCode}\n`;
    }
    
    readable += "\n=== COMPRESSED TEXT ===\n";
    
    // Show original text with visible compression
    let compressedView = "";
    for (let i = 0; i < Math.min(data.length, 1000); i++) { // Limit to first 1000 chars
      const code = this.huffmanCodes.get(data[i])!;
      compressedView += code + " ";
      if ((i + 1) % 10 === 0) compressedView += "\n";
    }
    
    if (data.length > 1000) {
      compressedView += "\n... (truncated for readability) ...";
    }
    
    readable += compressedView;
    readable += "\n\n=== ORIGINAL PREVIEW ===\n";
    readable += originalText.substring(0, 500);
    if (originalText.length > 500) {
      readable += "\n... (truncated for readability) ...";
    }
    
    return readable;
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
    
    // Step 2: Build Huffman tree using min heap
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
    const header = this.generateHeader(padding, data.length);
    
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
    
    // Generate human-readable version
    const readableCompressed = this.generateReadableCompressed(data);
    
    return {
      compressedData: result,
      originalSize: data.length,
      compressedSize: result.length,
      compressionRatio: (1 - result.length / data.length) * 100,
      huffmanCodes: new Map(this.huffmanCodes),
      header,
      readableCompressed
    };
  }

  /**
   * Decompress Huffman-compressed data
   */
  public decompress(compressedData: Uint8Array): DecompressionResult {
    if (compressedData.length < 8) {
      throw new Error("Invalid compressed data: too short");
    }

    let offset = 0;
    
    // Check header marker
    if (compressedData[offset] !== 0x48 || compressedData[offset + 1] !== 0x46) {
      throw new Error("Invalid compressed data: missing header marker");
    }
    offset += 2;
    
    // Read original file size (4 bytes) - fix byte ordering
    const originalSize = (compressedData[offset] << 24) | 
                        (compressedData[offset + 1] << 16) | 
                        (compressedData[offset + 2] << 8) | 
                        compressedData[offset + 3];
    offset += 4;
    
    // Read number of unique characters (2 bytes)
    const uniqueCharCount = (compressedData[offset] << 8) | compressedData[offset + 1];
    offset += 2;
    
    // Rebuild Huffman tree from stored codes
    const codeToChar = new Map<string, number>();
    
    for (let i = 0; i < uniqueCharCount; i++) {
      const character = compressedData[offset++];
      const codeLength = compressedData[offset++];
      
      // Read code bits
      const codeBytes = Math.ceil(codeLength / 8);
      let code = "";
      
      for (let byteIdx = 0; byteIdx < codeBytes; byteIdx++) {
        const codeByte = compressedData[offset++];
        for (let bit = 7; bit >= 0 && code.length < codeLength; bit--) {
          code += ((codeByte >> bit) & 1) ? '1' : '0';
        }
      }
      
      codeToChar.set(code, character);
    }
    
    // Read padding
    const padding = compressedData[offset++];
    
    // Decompress data using code lookup
    const decompressed: number[] = [];
    const compressedPayload = compressedData.slice(offset);
    
    let currentCode = "";
    let bitsProcessed = 0;
    const totalBits = compressedPayload.length * 8 - padding;
    
    for (let i = 0; i < compressedPayload.length && bitsProcessed < totalBits; i++) {
      const byte = compressedPayload[i];
      
      for (let bit = 7; bit >= 0 && bitsProcessed < totalBits; bit--) {
        const bitValue = (byte >> bit) & 1;
        currentCode += bitValue.toString();
        
        // Check if current code matches any character
        if (codeToChar.has(currentCode)) {
          decompressed.push(codeToChar.get(currentCode)!);
          currentCode = "";
          
          // Stop when we've decompressed the expected amount
          if (decompressed.length >= originalSize) {
            break;
          }
        }
        
        bitsProcessed++;
      }
      
      if (decompressed.length >= originalSize) {
        break;
      }
    }
    
    return {
      decompressedData: new Uint8Array(decompressed),
      originalSize: originalSize
    };
  }
}