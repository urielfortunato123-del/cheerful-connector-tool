import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/memorial')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/memorial"!</div>
}
