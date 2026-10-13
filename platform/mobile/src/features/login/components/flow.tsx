import { interpolate } from "@engine/parse";
import { field, row } from "@engine/spec";
import { failureMessages, type Messages } from "@engine/translate";
import { useRouter } from "expo-router";
import { useState } from "react";
import CodeForm from "@/components/code-form";
import CredentialsForm, { type Credentials } from "@/components/credentials-form";
import Titled from "@/components/titled";
import { useSession } from "@/hooks/use-session";
import { useWrite } from "@/hooks/use-write";
import type { FeatureProps } from "@/lib/spec/feature";

export type Options = { title: string; email: string; password: string; continue: string; otp: string; verify: string; sent: string; back: string; failed: string; errors: Messages };

type Challenge = { token: string; destination: string };

export default function Flow ({ options, ports, feature }: FeatureProps<Options>) {

    const router = useRouter();
    const { start } = useSession();
    const login = useWrite(ports.login);
    const verify = useWrite(ports.verify);
    const [challenge, setChallenge] = useState<Challenge | null>(null);
    const submitCredentials = async ( value: Credentials ): Promise<void> => {

        const answer = await login.run(value);
        const data = row(answer?.resource);
        const token = field(data, "challenge_token");

        if ( token ) setChallenge({ token, destination: field(data, "destination") ?? "" });

    };
    const submitCode = async ( otp: string ): Promise<void> => {

        if ( !challenge ) return;

        const answer = await verify.run({ challenge_token: challenge.token, otp });
        const data = row(answer?.resource);
        const token = field(data, "token");
        const user = data?.user;

        if ( token && user && typeof user === "object" ) {

            start(token, user as { id: number; permissions: string[] });
            if ( router.canGoBack() ) router.back();
            else router.replace("/");

        }

    };
    const codeError = verify.status === "failed" ? (failureMessages(verify.error, options.errors, options.failed)._form ?? failureMessages(verify.error, options.errors, options.failed).otp) : undefined;

    return (

        <Titled id={feature?.slug ?? "login"} title={options.title} primary={feature?.heading ?? false}>

            {challenge ? (

                <CodeForm
                    labels={{ code: options.otp, submit: options.verify, back: options.back, sent: interpolate(options.sent, { destination: challenge.destination }) }}
                    busy={verify.status === "pending"}
                    error={codeError}
                    onSubmit={submitCode}
                    onBack={() => { setChallenge(null); verify.reset(); }}
                />

            ) : (

                <CredentialsForm
                    labels={{ email: options.email, password: options.password, submit: options.continue }}
                    busy={login.status === "pending"}
                    errors={login.status === "failed" ? failureMessages(login.error, options.errors, options.failed) : {}}
                    onSubmit={submitCredentials}
                />

            )}

        </Titled>

    );

}
