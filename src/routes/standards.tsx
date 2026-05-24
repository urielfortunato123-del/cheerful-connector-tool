import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/standards')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/standards"!</div>
}
