import React from "react";
import VercelInviteUserEmail from "../emails/vercel-invite-user";
import { render } from "./renderer/renderer";

console.log(
  "\n<VercelInviteUserEmail {...VercelInviteUserEmail.PreviewProps} />\n",
  await render(
    <VercelInviteUserEmail {...VercelInviteUserEmail.PreviewProps} />,
  ),
);

const randomUserPromise = fetch("https://randomuser.me/api/").then((res) =>
  res.json(),
);

function SuspendingComponent() {
  const user = React.use(randomUserPromise);

  return (
    <pre>
      <code>{JSON.stringify(user)}</code>
    </pre>
  );
}

console.log(
  `\n<React.Suspense>
  <SuspendingComponent />
</React.Suspense>\n`,
  await render(
    <React.Suspense>
      <SuspendingComponent />
    </React.Suspense>,
  ),
);
