'use client';

import React, { useState } from 'react';
import { ChevronDown, RefreshCw, List, SlidersHorizontal, Check } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Table, TableHead, TableHeader, TableRow } from './ui/table';

type ColumnKeys = 'campaign' | 'subscriber' | 'message' | 'dateAdded';
type ColumnsState = Record<ColumnKeys, boolean>;

export default function AbuseComplaintsPage() {
  // Active (applied) columns
  const [columns, setColumns] = useState<ColumnsState>({
    campaign: true,
    subscriber: true,
    message: true,
    dateAdded: true,
  });

  // Temporary (staged) column state
  const [tempColumns, setTempColumns] = useState(columns);
  const [open, setOpen] = useState(false); 

  const handleTempToggle = (key: keyof typeof tempColumns) => {
    setTempColumns((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSaveChanges = () => {
    setColumns(tempColumns);
    setOpen(false); 
  };

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-950 min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <List className="text-gray-700 dark:text-gray-300" />
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-300">
          Abuse complaints
        </h2>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 mb-4">
        <DropdownMenu open={open} onOpenChange={(isOpen)=>setOpen(isOpen)}>
          <DropdownMenuTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
               <SlidersHorizontal className="mr-2 h-4 w-4" />
              Toggle columns
              
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent className="w-56 max-h-80 overflow-y-auto">
            <div className="p-2 space-y-2">
              {(Object.keys(columns) as ColumnKeys[]).map((column) => (
                <div key={column} className="flex items-center space-x-2">
                  <div
                    className={`w-4 h-4 rounded border-2 flex items-center justify-center cursor-pointer ${
                      tempColumns[column] ? "bg-blue-500 border-blue-500" : "border-gray-300"
                    }`}
                    onClick={() => handleTempToggle(column)}
                  >
                    {tempColumns[column] && <Check className="h-3 w-3 text-white" />}
                  </div>
                  <label
                    className="text-sm cursor-pointer flex-1"
                    onClick={() => handleTempToggle(column)}
                  >
                    {column.charAt(0).toUpperCase() + column.slice(1).replace(/([A-Z])/g, ' $1')}
                  </label>
                </div>
              ))}
              <div className="pt-2 border-t">
                <Button 
                  onClick={handleSaveChanges} 
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                >
                  Save changes
                </Button>
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Refresh button */}
        <Button
          variant="outline"
          className="text-blue-600 border-blue-600 dark:hover:bg-blue-600 hover:bg-blue-100"
        >
          <RefreshCw className="h-4 w-4 mr-2" /> Refresh
        </Button>
      </div>

      {/* filter Table */}
      <div className=" border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        <Table className="w-full text-left border-collapse">
          <TableHeader className="bg-gray-100 dark:bg-gray-800">
            <TableRow className="text-gray-700 dark:text-gray-300">
              {columns.campaign && <TableHead className="p-3 ">Campaign</TableHead>}
              {columns.subscriber && <TableHead className="p-3 ">Subscriber</TableHead>}
              {columns.message && <TableHead className="p-3 ">Message</TableHead>}
              {columns.dateAdded && <TableHead className="p-3 ">Date added</TableHead>}
              <TableHead className="p-3 font-semibold">Options</TableHead>
            </TableRow>

            {/* Check Row exists */}
            <tr className="bg-gray-50 dark:bg-gray-950">
              {columns.campaign && (
                <td className="p-3">
                  <input
                    type="text"
                    className="w-full border rounded-md px-2 py-1 text-sm bg-gray-50 dark:bg-gray-950 focus:bg-white focus:ring-1 focus:ring-blue-400"
                  />
                </td>
              )}
              {columns.subscriber && (
                <td className="p-3">
                  <input
                    type="text"
                    className="w-full border rounded-md px-2 py-1 text-sm bg-gray-50 dark:bg-gray-950 focus:bg-white focus:ring-1 focus:ring-blue-400"
                  />
                </td>
              )}
              {columns.message && (
                <td className="p-3">
                  <input
                    type="text"
                    className="w-full border rounded-md px-2 py-1 text-sm bg-gray-50 dark:bg-gray-950 focus:bg-white focus:ring-1 focus:ring-blue-400"
                  />
                </td>
              )}
              {columns.dateAdded && (
                <td className="p-3">
                  <input
                    type="text"
                    className="w-full border rounded-md px-2 py-1 text-sm bg-gray-50 dark:bg-gray-950 focus:bg-white focus:ring-1 focus:ring-blue-400"
                  />
                </td>
              )}
              <td className="p-3"></td>
            </tr>
          </TableHeader>
          <tbody>
            <tr>
              <td colSpan={5} className="p-6 text-center text-gray-400 italic">
                No results found.
              </td>
            </tr>
          </tbody>
        </Table>
      </div>

      
      <div className="flex justify-end mt-4">
        <select className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-1 focus:ring-blue-400">
          <option>10</option>
          <option>25</option>
          <option>50</option>
        </select>
      </div>
    </div>
  );
}
