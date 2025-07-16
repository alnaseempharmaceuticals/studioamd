'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface MarkdownTableProps {
  markdown: string;
}

export function MarkdownTable({ markdown }: MarkdownTableProps) {
  const lines = markdown.trim().split('\n');
  
  if (lines.length < 2) {
    return <pre className="font-code p-4 bg-muted rounded-md overflow-x-auto">{markdown}</pre>;
  }

  const cleanCell = (cell: string) => cell.trim();

  const headerCells = lines[0].split('|').slice(1, -1).map(cleanCell);
  const bodyRows = lines.slice(2).map(line => 
    line.split('|').slice(1, -1).map(cleanCell)
  );

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            {headerCells.map((header, index) => (
              <TableHead key={index}>{header}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {bodyRows.map((row, rowIndex) => (
            <TableRow key={rowIndex}>
              {row.map((cell, cellIndex) => (
                <TableCell key={cellIndex} className={cellIndex === 0 ? 'font-medium' : ''}>
                    {cell}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
