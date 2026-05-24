import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/financial')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/financial"!</div>
}
