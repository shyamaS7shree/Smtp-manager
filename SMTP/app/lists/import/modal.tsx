import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"

interface ModalProps {
  field: string
}

export default function Modal({ field }: ModalProps): React.JSX.Element {
  const isExternalDB:boolean = field === "Import from external SQL database"

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-md px-8 py-1">
          Upload File
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-lg sm:max-w-xl rounded-2xl p-6 space-y-4">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900">{field}</DialogTitle>
          <DialogDescription className="text-sm text-gray-600">
            {isExternalDB
              ? "Please enter your credentials for the external database in order to start the import."
              : `Please note, we only accept valid CSV files that contain a header, that is the column names for the data to be imported.
                We also have a limit on the file size you are allowed to upload, that is 3MB.
                The import process might fail with some of the files, mainly because these are not correctly formatted or they contain invalid data.
                You should first do a test import(in a test list) and see if that goes as planned then do it for your actual list.
                Important: The CSV file column names will be used to create the list TAGS, if a tag does not exist, it will be created.
                You can also click here to see a csv file example.`}
          </DialogDescription>
        </DialogHeader>

        {isExternalDB ? (
          <div className=" my-[8rem]">
            <div>
              <Label htmlFor="db">Server Type *</Label>
              <Select>
                <SelectTrigger id="db" className="mt-1">
                  <SelectValue placeholder="Select server type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MySQL">MySQL</SelectItem>
                  <SelectItem value="SQLServer">SQL Server</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="hostname">Hostname *</Label>
                <Input id="hostname" placeholder="e.g. mysql.databaseclusters.com" />
              </div>
              <div>
                <Label htmlFor="port">Port *</Label>
                <Input id="port" value="3306" readOnly />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="username">Username *</Label>
                <Input id="username" placeholder="e.g. mysqlcluster" />
              </div>
              <div>
                <Label htmlFor="pass">Password *</Label>
                <Input id="pass" type="password" placeholder="••••••••••" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="dbname">Database Name *</Label>
                <Input id="dbname" placeholder="e.g. my_blog" />
              </div>
              <div>
                <Label htmlFor="tableName">Table Name *</Label>
                <Input id="tableName" placeholder="e.g. tbl_subscribers" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="emailcol">Email Column *</Label>
                <Input id="emailcol" placeholder="e.g. email" />
              </div>
              <div>
                <Label htmlFor="ignore">Ignored Columns *</Label>
                <Input id="ignore" placeholder="e.g. id, date_added, status" />
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3 ">
            <Label htmlFor="file">Upload CSV File *</Label>
            <Input id="file" type="file" className="cursor-pointer" />
            <p className="text-xs text-gray-500">
              You can also{" "}
              <a
                href="#"
                className="text-blue-600 hover:underline"
              >
                see a CSV file example
              </a>{" "}
              for reference.
            </p>
          </div>
        )}

        <DialogFooter className="flex justify-end gap-3 pt-4">
          <Button variant="outline">Close</Button>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            {isExternalDB ? "Connect & Import" : "Upload & Import"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
