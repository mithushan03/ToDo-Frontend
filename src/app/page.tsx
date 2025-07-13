"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { DateRange } from "react-day-picker";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Pencil, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { TodoForm } from "@/components/TodoForm";
import * as z from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  category: z.string(),
  status: z.string(),
});

interface Todo {
  _id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  createdAt: string;
  modifiedAt: string;
}

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState<string[]>([]);
  const [date, setDate] = useState<DateRange | undefined>();
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<any>({});
  const [isCreateDialogOpen, setCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);

  const fetchTodos = async () => {
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (category) params.append("category", category);
    if (status.length > 0) params.append("status", status.join(","));
    if (date?.from) params.append("start_date", date.from.toISOString());
    if (date?.to) params.append("end_date", date.to.toISOString());
    params.append("page", page.toString());
    params.append("limit", "5");

    try {
      const res = await fetch(`http://localhost:5000/api/v1/todos?${params.toString()}`);
      const data = await res.json();
      setTodos(data.data);
      setPagination(data.pagination);
    } catch (error) {
      console.error("Error fetching todos:", error);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, [search, category, status, date, page]);

  const handleCreate = async (values: z.infer<typeof formSchema>) => {
    console.log("Creating TODO with values:", values);
    try {
      await fetch("http://localhost:5000/api/v1/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
    } catch (error) {
      console.error("Error creating todo:", error);
    }
    await fetchTodos();
    setCreateDialogOpen(false);
  };

  const handleUpdate = async (values: z.infer<typeof formSchema>) => {
    if (!selectedTodo) return;
    try {
      await fetch(`http://localhost:5000/api/v1/todos/${selectedTodo._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
    } catch (error) {
      console.error("Error updating todo:", error);
    }
    await fetchTodos();
    setEditDialogOpen(false);
    setSelectedTodo(null);
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`http://localhost:5000/api/v1/todos/${id}`, {
        method: "DELETE",
      });
      await fetchTodos();
    } catch (error) {
      console.error("Error deleting todo:", error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 shadow-md">
        <div className="mx-auto text-center">
          <h1 className="text-3xl font-bold">ToDo App</h1>
        </div>
      </header>
      <main className="flex-grow flex items-center justify-center p-4">
        <Card className="w-full max-w-6xl">
          <CardHeader>
            <CardTitle>ToDo App</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 mb-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-4">
                  <Input
                    placeholder="Search..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-64"
                  />
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Homework">Homework</SelectItem>
                      <SelectItem value="Office Work">Office Work</SelectItem>
                    </SelectContent>
                  </Select>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id="date"
                        variant={"outline"}
                        className={cn(
                          "w-[300px] justify-start text-left font-normal",
                          !date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date?.from ? (
                          date.to ? (
                            <>
                              {format(date.from, "LLL dd, y")} -{" "}
                              {format(date.to, "LLL dd, y")}
                            </>
                          ) : (
                            format(date.from, "LLL dd, y")
                          )
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={date?.from}
                        selected={date}
                        onSelect={setDate}
                        numberOfMonths={2}
                      />
                    </PopoverContent>
                  </Popover>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearch("");
                      setCategory("");
                      setStatus([]);
                      setDate(undefined);
                      setPage(1);
                    }}
                  >
                    Reset Filters
                  </Button>
                </div>
                <Dialog open={isCreateDialogOpen} onOpenChange={setCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-blue-500 hover:bg-blue-600 text-white">Create TODO</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create TODO</DialogTitle>
                    </DialogHeader>
                    <TodoForm onSubmit={handleCreate} />
                  </DialogContent>
                </Dialog>
              </div>
              <div className="flex flex-wrap justify-center gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox id="not-started" checked={status.includes("Not Started")} onCheckedChange={(checked) => {
                    if (checked) {
                      setStatus([...status, "Not Started"]);
                    } else {
                      setStatus(status.filter((s) => s !== "Not Started"));
                    }
                  }} />
                  <label htmlFor="not-started">Not Started</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="pending" checked={status.includes("Pending")} onCheckedChange={(checked) => {
                    if (checked) {
                      setStatus([...status, "Pending"]);
                    } else {
                      setStatus(status.filter((s) => s !== "Pending"));
                    }
                  }} />
                  <label htmlFor="pending">Pending</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="completed" checked={status.includes("Completed")} onCheckedChange={(checked) => {
                    if (checked) {
                      setStatus([...status, "Completed"]);
                    } else {
                      setStatus(status.filter((s) => s !== "Completed"));
                    }
                  }} />
                  <label htmlFor="completed">Completed</label>
                </div>
              </div>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead>Modified At</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {todos.map((todo) => (
                  <TableRow key={todo._id}>
                    <TableCell>{todo.title}</TableCell>
                    <TableCell>{todo.description}</TableCell>
                    <TableCell>{todo.category}</TableCell>
                    <TableCell>{todo.status}</TableCell>
                    <TableCell>{new Date(todo.createdAt).toLocaleString()}</TableCell>
                    <TableCell>{new Date(todo.modifiedAt).toLocaleString()}</TableCell>
                    <TableCell className="flex space-x-2">
                      <Dialog open={isEditDialogOpen && selectedTodo?._id === todo._id} onOpenChange={(isOpen) => {
                        if (!isOpen) {
                          setEditDialogOpen(false);
                          setSelectedTodo(null);
                        } else {
                          setEditDialogOpen(true);
                          setSelectedTodo(todo);
                        }
                      }}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="icon" onClick={() => {
                            setEditDialogOpen(true);
                            setSelectedTodo(todo);
                          }}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Edit TODO</DialogTitle>
                          </DialogHeader>
                          <TodoForm onSubmit={handleUpdate} initialData={selectedTodo} />
                        </DialogContent>
                      </Dialog>
                      <Button variant="outline" size="icon" onClick={() => handleDelete(todo._id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="flex justify-between items-center mt-4">
              <Button
                disabled={!pagination.prev}
                onClick={() => setPage(pagination.prev.page)}
              >
                Previous
              </Button>
              <span>
                Page {page} of {Math.ceil(pagination.total / 5) || 1}
              </span>
              <Button
                disabled={!pagination.next}
                onClick={() => setPage(pagination.next.page)}
              >
                Next
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
      <footer className="bg-gray-800 text-white p-4 text-center">
        <p>&copy; {new Date().getFullYear()} TODO App. All rights reserved.</p>
      </footer>
    </div>
  );
}
