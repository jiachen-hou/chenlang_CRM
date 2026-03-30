import React from 'react';
import { Database, KeyRound, Server } from 'lucide-react';

export default function SetupInstructions() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans text-gray-900">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <Database className="mx-auto h-12 w-12 text-indigo-600" />
          <h2 className="mt-4 text-3xl font-extrabold text-gray-900 tracking-tight">
            Supabase Configuration Required
          </h2>
          <p className="mt-2 text-lg text-gray-600">
            Please connect your Supabase project to continue.
          </p>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
          <div className="px-4 py-5 sm:px-6 bg-indigo-50 border-b border-indigo-100">
            <h3 className="text-lg leading-6 font-medium text-indigo-900 flex items-center">
              <KeyRound className="h-5 w-5 mr-2" />
              Step 1: Add Environment Variables
            </h3>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <p className="mb-4 text-sm text-gray-600">
              In AI Studio, open the <strong>Settings</strong> menu (gear icon) and add the following secrets. You can find these in your Supabase Dashboard under <strong>Project Settings &gt; API</strong>.
            </p>
            <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700">
              <li><code>VITE_SUPABASE_URL</code>: Your Project URL</li>
              <li><code>VITE_SUPABASE_ANON_KEY</code>: Your Project API Key (anon/public)</li>
            </ul>
            <p className="mt-4 text-sm text-gray-500 italic">
              Note: If deploying to Netlify, add these exact same variables in your Netlify Site Settings &gt; Environment Variables.
            </p>
          </div>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 bg-indigo-50 border-b border-indigo-100">
            <h3 className="text-lg leading-6 font-medium text-indigo-900 flex items-center">
              <Server className="h-5 w-5 mr-2" />
              Step 2: Run Database Migrations
            </h3>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <p className="mb-4 text-sm text-gray-600">
              Go to your Supabase Dashboard, open the <strong>SQL Editor</strong>, and run the following SQL to create the necessary tables and security policies:
            </p>
            <div className="bg-gray-900 rounded-md p-4 overflow-x-auto">
              <pre className="text-sm text-green-400 font-mono">
{`-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create customers table
create table public.customers (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  company text,
  email text,
  phone text,
  status text default 'Active',
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create journeys table
create table public.journeys (
  id uuid default uuid_generate_v4() primary key,
  customer_id uuid references public.customers on delete cascade not null,
  user_id uuid references auth.users not null,
  visit_date date not null,
  type text not null,
  notes text,
  next_steps text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up Row Level Security (RLS)
alter table public.customers enable row level security;
alter table public.journeys enable row level security;

-- Create policies for customers
create policy "Users can view their own customers"
  on public.customers for select using ( auth.uid() = user_id );

create policy "Users can insert their own customers"
  on public.customers for insert with check ( auth.uid() = user_id );

create policy "Users can update their own customers"
  on public.customers for update using ( auth.uid() = user_id );

create policy "Users can delete their own customers"
  on public.customers for delete using ( auth.uid() = user_id );

-- Create policies for journeys
create policy "Users can view their own journeys"
  on public.journeys for select using ( auth.uid() = user_id );

create policy "Users can insert their own journeys"
  on public.journeys for insert with check ( auth.uid() = user_id );

create policy "Users can update their own journeys"
  on public.journeys for update using ( auth.uid() = user_id );

create policy "Users can delete their own journeys"
  on public.journeys for delete using ( auth.uid() = user_id );`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
