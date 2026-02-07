"use client";

import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-gray-300">
          Welcome. Use the menu to answer polls, submit evaluations, and view teams.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
        {/* Polls Card */}
        <div className="card-modern p-6">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white">Weekly Poll</h2>
          </div>
          <p className="text-gray-300 mb-4">Can you play this Friday?</p>
          <div className="flex space-x-4">
            <Link
              href="/polls"
              className="btn btn-primary flex-1 py-2 px-4 rounded-lg font-semibold text-center"
            >
              Yes, I'm in!
            </Link>
            <Link
              href="/polls"
              className="btn btn-danger flex-1 py-2 px-4 rounded-lg font-semibold text-center"
            >
              Can't make it
            </Link>
          </div>
        </div>

        {/* Evaluations Card */}
        <div className="card-modern p-6">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-purple-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white">Monthly Evaluation</h2>
          </div>
          <p className="text-gray-300 mb-4">Evaluate 5 teammates this month</p>
          <Link
            href="/evaluations"
            className="btn btn-secondary w-full py-2 px-4 rounded-lg font-semibold text-center"
          >
            Start Evaluation
          </Link>
        </div>

        {/* Teams Card */}
        <div className="card-modern p-6">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white">Team Distribution</h2>
          </div>
          <p className="text-gray-300 mb-4">Generate balanced teams for Friday</p>
          <Link
            href="/teams"
            className="btn btn-primary w-full py-2 px-4 rounded-lg font-semibold text-center"
          >
            Generate Teams
          </Link>
        </div>

        {/* Profile Card */}
        <div className="card-modern p-6">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mr-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-yellow-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white">Profile</h2>
          </div>
          <p className="text-gray-300 mb-4">Create or update your player profile</p>
          <Link
            href="/profile"
            className="btn btn-secondary w-full py-2 px-4 rounded-lg font-semibold text-center"
          >
            Update Profile
          </Link>
        </div>
      </div>
    </div>
  );
}
