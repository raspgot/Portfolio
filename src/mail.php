<?php
    use PHPMailer\PHPMailer\SMTP;
    use PHPMailer\PHPMailer\PHPMailer;

    date_default_timezone_set('Europe/Paris');

    require '../vendor/autoload.php';

    $secret_token = '';

    function secure($data) {
        $data = trim($data);
        $data = stripslashes($data);
        $data = htmlspecialchars($data);
        return $data;
    }

    function dieJson($data) {
        return die(json_encode($data));
    }
    
    if ($_SERVER["REQUEST_METHOD"] == "GET") {
        $firstname = !empty($_GET['firstname']) || strlen($_GET['firstname']) <= 3 ? filter_var(secure($_GET['firstname']), FILTER_SANITIZE_STRING) : dieJson("Saisissez votre prénom (min 3 caractères).");
        $lastname  = !empty($_GET['lastname']) || strlen($_GET['lastname']) <= 3 ? filter_var(secure($_GET['lastname']), FILTER_SANITIZE_STRING) : dieJson("Saisissez votre nom (min 3 caractères).");
        $email     = !empty($_GET['email']) ? filter_var(secure($_GET['email']), FILTER_SANITIZE_EMAIL) : dieJson("Saisissez votre email.");
        $message   = !empty($_GET['message']) || strlen($_GET['message']) <= 5 ? filter_var(secure($_GET['message']), FILTER_SANITIZE_STRING) : dieJson("Saisissez votre message (min 5 caractères).");
        $token     = !empty($_GET['recaptcha-token']) ? filter_var(secure($_GET['recaptcha-token']), FILTER_SANITIZE_STRING) : dieJson("Token invalide.");
        $date_tmp  = new DateTime();
        $date      = $date_tmp->format('j/m/Y H:i:s');

        $recaptcha = new \ReCaptcha\ReCaptcha($secret_token);
        $resp = $recaptcha
            ->setExpectedHostname($_SERVER['SERVER_NAME'])
            ->verify($token, $_SERVER['REMOTE_ADDR']);
            
        if ($resp->isSuccess()) {
            $mail = new PHPMailer(true);
            try {
                $mail->SMTPDebug  = SMTP::DEBUG_OFF;
                $mail->isSMTP();
                $mail->Host       = 'mail.infomaniak.com';
                $mail->SMTPAuth   = true;
                $mail->Username   = 'contact@raspgot.fr';
                $mail->Password   = '';
                $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
                $mail->Port       = 587;

                //Recipients
                $mail->setFrom('contact@raspgot.fr', 'Raspgot');
                $mail->addAddress('gauthierw630@gmail.com', 'Gauthier');
                $mail->addReplyTo($email, $firstname);

                // Content
                $mail->CharSet = 'UTF-8';
                $mail->isHTML(true);
                $mail->Subject = 'Formulmaire de contact';
                $mail->Body    = '<h1>Nouveau message !</h1>
                <b>Date:</b> ' . $date . '<br>
                <b>Prénom:</b> ' . $firstname . '<br>
                <b>Nom:</b> ' . $lastname. '<br>
                <b>Email:</b> ' . $email. '<br>
                <b>Message:</b> ' . $message;
                $mail->AltBody = 'Date: ' . $date . 'Prénom: ' . $firstname . 'Nom: ' . $lastname. 'Email: ' . $email. 'Message: ' . $message;

                $mail->send();
                dieJson('Votre message à bien été envoyé ! <br> Je vous répondrai dans les plus bref délais');
            } catch (Exception $e) {
                dieJson('Mailer Error: ' . $mail->ErrorInfo);
            }
        } else {
            dieJson($resp->getErrorCodes());
        }
    }
?>