import Link from "next/link";
import { PageBody, PageHeader } from "@/components/layout/app-shell";
import { EmptyState } from "@/components/ui/states";

export const metadata = {
  title: "Not found",
};

export default function NotFound() {
  return (
    <>
      <PageHeader title="Not found" />
      <PageBody>
        <EmptyState
          title="There is no record at this address."
          description={
            <p>
              The route may belong to a module that has not been built yet. The{" "}
              <Link href="/" className="text-link underline underline-offset-2">
                Command Center
              </Link>{" "}
              lists every module that currently exists.
            </p>
          }
        />
      </PageBody>
    </>
  );
}
