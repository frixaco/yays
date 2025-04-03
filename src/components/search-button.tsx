"use client";

import { useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "./ui/card";

export function SearchButton() {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState([]);

  const search = async () => {
    setIsLoading(true);
    const response = await fetch(`/api/pinecone?query=${query}`);
    const data = await response.json();
    console.log(data);
    setResults(data);
    setIsLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <Input
          type="text"
          name="query"
          onChange={(e) => setQuery(e.target.value)}
        />
        <Button onClick={() => search()}>Search</Button>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <p>Loading...</p>
        ) : (
          <kbd>{JSON.stringify(results, null, 2)}</kbd>
        )}
      </CardContent>
    </Card>
  );
}
