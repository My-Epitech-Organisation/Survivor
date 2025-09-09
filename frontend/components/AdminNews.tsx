"use client"
import { TableRow, TableCell } from "@/components/ui/table";
import { FaTrashAlt } from "react-icons/fa";
import { IoSettingsOutline } from "react-icons/io5";
import { NewsDetailItem } from "@/types/news";
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogHeader, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useRef } from "react";
import AdminNewsForm from "@/components/AdminNewsForm";

interface AdminNewsProps {
  news: NewsDetailItem,
  editCB: (newsId: number, data: NewsDetailItem, btnAction: HTMLButtonElement | null) => void
  deleteCB: (newsId: number, btnAction: HTMLButtonElement | null) => void
}

export default function AdminNews (props: AdminNewsProps)
{
  const closeBtn = useRef<HTMLButtonElement>(null);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  return (
    <TableRow key={props.news.id} className="hover:bg-gray-50 transition-colors">
      <TableCell className="text-center border-r border-gray-200 align-middle text-app-text-secondary">{props.news.id}</TableCell>
      <TableCell className="text-center border-l border-gray-200 align-middle font-medium text-app-text-primary">{props.news.title}</TableCell>
      <TableCell className="text-center border-l border-gray-200 align-middle text-app-text-secondary">{props.news.category}</TableCell>
      <TableCell className="text-center border-l border-gray-200 align-middle text-app-text-secondary">{formatDate(props.news.news_date)}</TableCell>
      <TableCell className="text-center border-l border-gray-200 align-middle text-app-text-secondary">{props.news.location}</TableCell>
      <TableCell className="text-center border-l border-gray-200 align-middle text-app-text-secondary">
        {props.news.startup_id || 'None'}
      </TableCell>
      <TableCell className="text-center border-l border-gray-200 align-middle">
        <Dialog>
          <DialogTrigger asChild>
            <button
              className="p-2 rounded-full hover:bg-blue-50 transition-colors w-full flex items-center justify-center cursor-pointer"
              aria-label="Edit"
              title={`Edit ${props.news.title}`}
            >
              <IoSettingsOutline className="text-xl text-gray-500" />
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[400px] md:max-w-[60dvw] max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                Edit News
              </DialogTitle>
            </DialogHeader>
            <AdminNewsForm
              defaultData={props.news}
              onSubmit={(data) => props.editCB(props.news.id, data, closeBtn.current)}
            />
          </DialogContent>
        </Dialog>
      </TableCell>
      <TableCell className="text-center border-l border-gray-200 align-middle">
        <Dialog>
          <DialogTrigger asChild>
            <button
              className="p-2 rounded-full hover:bg-red-50 transition-colors w-full flex items-center justify-center cursor-pointer"
              aria-label="Delete"
              title={`Delete ${props.news.title}`}
            >
              <FaTrashAlt className="text-xl text-red-500" />
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                Delete News
              </DialogTitle>
            </DialogHeader>
            <div className="py-4 text-center text-app-text-primary">
              <p>
                Are you sure you want to <span className="font-semibold text-red-600">delete</span> the news <span className="font-semibold">&ldquo;{props.news.title}&rdquo;</span> ?
              </p>
            </div>
            <DialogFooter className="flex justify-center gap-2 mt-2">
              <DialogClose asChild ref={closeBtn}>
                <Button variant="outline" className="min-w-[90px]">Cancel</Button>
              </DialogClose>
              <Button
                type="button"
                variant="destructive"
                className="min-w-[90px]"
                onClick={() => props.deleteCB(props.news.id, closeBtn.current)}
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </TableCell>
    </TableRow>
  );
}
