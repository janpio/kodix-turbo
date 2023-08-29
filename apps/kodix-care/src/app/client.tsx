"use client";

import React from "react";

import { api } from "~/utils/api";

export default function Client() {
  const apps = api.test.test.useQuery({ source: "client" });

  return <div className="">{JSON.stringify(apps.data)}</div>;
}
