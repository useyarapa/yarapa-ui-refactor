import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
} from "../table";
import {
  Pagination,
  PaginationButton,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "../pagination";
import { Badge } from "../badge";
import { Avatar, AvatarFallback } from "../avatar";

const meta: Meta = { title: "Data display" };
export default meta;

const rows = [
  { id: "1", name: "Design review", status: "Open", owner: "AR" },
  { id: "2", name: "Token audit", status: "Done", owner: "JP" },
  { id: "3", name: "A11y sweep", status: "In progress", owner: "SM" },
];

export const TableStory: StoryObj = {
  name: "Table + Pagination",
  render: () => (
    <div className="flex w-[36rem] flex-col gap-4">
      <Table>
        <TableCaption>Current tasks — sortable headers are caller-supplied.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Task</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Owner</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              <TableCell>{row.name}</TableCell>
              <TableCell>
                <Badge tone={row.status === "Done" ? "success" : row.status === "Open" ? "neutral" : "brand"}>
                  {row.status}
                </Badge>
              </TableCell>
              <TableCell>
                <span className="inline-flex items-center gap-2">
                  <Avatar className="size-6">
                    <AvatarFallback>{row.owner}</AvatarFallback>
                  </Avatar>
                  {row.owner}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Pagination className="justify-end">
        <PaginationPrevious aria-label="Previous page" />
        <PaginationButton aria-label="Page 1" aria-current="page">1</PaginationButton>
        <PaginationButton aria-label="Page 2">2</PaginationButton>
        <PaginationEllipsis />
        <PaginationButton aria-label="Page 5">5</PaginationButton>
        <PaginationNext aria-label="Next page" />
      </Pagination>
    </div>
  ),
};
