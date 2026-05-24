import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/as-built')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/as-built"!</div>
}
