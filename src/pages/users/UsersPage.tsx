import React, { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, Edit, Trash2, Mail, Shield, Clock } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DataTable } from '@/components/common/DataTable';
import { User, UserRole } from '@/types';
import { formatDate } from '@/utils';

// Mock data for demonstration
const mockUsers: User[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    role: UserRole.ADMIN,
    isActive: true,
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-20T14:45:00Z',
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: UserRole.USER,
    isActive: true,
    createdAt: '2024-01-16T09:15:00Z',
    updatedAt: '2024-01-18T16:20:00Z',
  },
  {
    id: '3',
    name: 'Bob Johnson',
    email: 'bob@example.com',
    role: UserRole.MODERATOR,
    isActive: false,
    createdAt: '2024-01-10T14:00:00Z',
    updatedAt: '2024-01-12T11:30:00Z',
  },
  {
    id: '4',
    name: 'Alice Brown',
    email: 'alice@example.com',
    role: UserRole.USER,
    isActive: true,
    createdAt: '2024-01-18T11:45:00Z',
    updatedAt: '2024-01-19T13:15:00Z',
  },
  {
    id: '5',
    name: 'Charlie Wilson',
    email: 'charlie@example.com',
    role: UserRole.USER,
    isActive: true,
    createdAt: '2024-01-12T08:30:00Z',
    updatedAt: '2024-01-14T17:00:00Z',
  },
];

function UserActions({ user }: { user: User }) {
  const handleEdit = () => {
    console.log('Edit user:', user.id);
  };

  const handleDelete = () => {
    console.log('Delete user:', user.id);
  };

  const handleSendEmail = () => {
    console.log('Send email to:', user.email);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => navigator.clipboard.writeText(user.id)}>
          Copy user ID
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleEdit}>
          <Edit className="mr-2 h-4 w-4" />
          Edit user
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleSendEmail}>
          <Mail className="mr-2 h-4 w-4" />
          Send email
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleDelete} className="text-destructive">
          <Trash2 className="mr-2 h-4 w-4" />
          Delete user
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function RoleBadge({ role }: { role: UserRole }) {
  const roleConfig = {
    [UserRole.ADMIN]: {
      label: 'Admin',
      className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      icon: Shield,
    },
    [UserRole.MODERATOR]: {
      label: 'Moderator',
      className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      icon: Shield,
    },
    [UserRole.USER]: {
      label: 'User',
      className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      icon: Shield,
    },
  };

  const config = roleConfig[role];
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${config.className}`}>
      <Icon className="mr-1 h-3 w-3" />
      {config.label}
    </span>
  );
}

function StatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
        isActive
          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
          : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
      }`}
    >
      <div
        className={`mr-1 h-2 w-2 rounded-full ${
          isActive ? 'bg-green-400' : 'bg-gray-400'
        }`}
      />
      {isActive ? 'Active' : 'Inactive'}
    </span>
  );
}

export function UsersPage() {
  const [users] = useState<User[]>(mockUsers);

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="flex items-center space-x-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="font-medium">{user.name}</div>
              <div className="text-sm text-muted-foreground">{user.email}</div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'role',
      header: 'Role',
      cell: ({ row }) => <RoleBadge role={row.getValue('role')} />,
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ row }) => <StatusBadge isActive={row.getValue('isActive')} />,
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
    {
      accessorKey: 'createdAt',
      header: 'Created',
      cell: ({ row }) => {
        const date = new Date(row.getValue('createdAt'));
        return (
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{formatDate(date)}</span>
          </div>
        );
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => <UserActions user={row.original} />,
      enableSorting: false,
      enableHiding: false,
    },
  ];

  const handleSelectionChange = (selectedUsers: User[]) => {
    console.log('Selected users:', selectedUsers);
  };

  const handleExport = (selectedUsers: User[]) => {
    console.log('Exporting users:', selectedUsers);
    // Here you would implement the actual export logic
    alert(`Exporting ${selectedUsers.length} users...`);
  };

  const handleDelete = (selectedUsers: User[]) => {
    console.log('Deleting users:', selectedUsers);
    // Here you would implement the actual delete logic
    if (confirm(`Are you sure you want to delete ${selectedUsers.length} users?`)) {
      alert(`${selectedUsers.length} users deleted!`);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">User Management</h2>
          <p className="text-muted-foreground">
            Manage users, roles, and permissions for your application.
          </p>
        </div>
        <Button>Add User</Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">Total Users</h3>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">{users.length}</div>
          <p className="text-xs text-muted-foreground">
            +2 from last week
          </p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">Active Users</h3>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">
            {users.filter(u => u.isActive).length}
          </div>
          <p className="text-xs text-muted-foreground">
            +5% from last month
          </p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">Admins</h3>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">
            {users.filter(u => u.role === UserRole.ADMIN).length}
          </div>
          <p className="text-xs text-muted-foreground">
            No change
          </p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">New This Month</h3>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">3</div>
          <p className="text-xs text-muted-foreground">
            +50% from last month
          </p>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        data={users}
        columns={columns}
        searchPlaceholder="Search users..."
        onSelectionChange={handleSelectionChange}
        onExport={handleExport}
        onDelete={handleDelete}
        enableSearch={true}
        enableFilters={true}
        enableSelection={true}
        enableExport={true}
        enableColumnVisibility={true}
        pageSize={10}
      />
    </div>
  );
}