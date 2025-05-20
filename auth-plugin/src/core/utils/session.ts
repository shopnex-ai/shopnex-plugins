import { SuccessKind } from "../../types";

export function sessionResponse(cookies: string[], returnURL?: string) {
    // Ensure the return URL is properly formatted
    const redirectURL = `${process.env.NEXT_PUBLIC_SERVER_URL}/admin/`;

    let responseHTML = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Authentication Complete</title>
      </head>
      <body>
        <script>
          (function() {
            const returnURL = ${JSON.stringify(redirectURL)};
            if (window.opener) {
              window.opener.location = returnURL; 
              window.close();
            } else {
              window.location.href = returnURL;
            }
          })();
        </script>
      </body>
    </html>
  `;

    let res = new Response(responseHTML, {
        status: 200,
        headers: {
            "Content-Type": "text/html; charset=utf-8",
        },
    });

    cookies.forEach((cookie) => {
        res.headers.append("Set-Cookie", cookie);
    });

    return res;
}

export const revokeSession = (cookies: string[]) => {
    const res = new Response(
        JSON.stringify({
            message: "Session revoked",
            kind: SuccessKind.Deleted,
            isSuccess: true,
            isError: false,
        }),
        {
            status: 200,
        }
    );

    cookies.forEach((cookie) => {
        res.headers.append("Set-Cookie", cookie);
    });
    return res;
};
