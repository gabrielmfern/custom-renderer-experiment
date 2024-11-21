import React, { Suspense } from "react";
import VercelInviteUserEmail from "../emails/vercel-invite-user";
import { render } from "./renderer/renderer";

console.log(await render(<VercelInviteUserEmail {...VercelInviteUserEmail.PreviewProps} />));

console.log(await render(<Suspense></Suspense>))
