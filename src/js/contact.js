var publicKey = "";

// Get token from API
function check_grecaptcha() {
    grecaptcha.ready(function () {
        grecaptcha.execute(publicKey, {
            action: "contact"
        }).then(function (token) {
            $("[name='recaptcha-token']").val(token);
        });
    });
}

$(function () {
    check_grecaptcha();
    $("form").validate({
        rules: {
            firstname: {
                required: true,
                minlength: 3
            },
            lastname: {
                required: true,
                minlength: 3
            },
            email: {
                required: true,
                email: true
            },
            message: {
                required: true,
                minlength: 5
            }
        },
        messages: {
            firstname: {
                required: "Veuillez saisir votre prénom",
                minlength: "Doit contenir au moins 3 caractères"
            },
            lastname: {
                required: "Veuillez saisir votre nom",
                minlength: "Doit contenir au moins 3 caractères"
            },
            email: "Veuillez saisir une adresse email valide",
            message: {
                required: "Veuillez saisir un message",
                minlength: "Votre message doit contenir au moins 5 caractères"
            }
        },
        errorClass: "invalid-feedback",
        highlight: function (element) {
            $(element).parents(".form-group").addClass("has-danger").removeClass("has-success");
        },
        unhighlight: function (element) {
            $(element).parents(".form-group").addClass("has-success").removeClass("has-danger");
        },
        submitHandler: function (form) {
            $('.spinner-border').removeClass("d-none");
            $.get(form.action, $(form).serialize())
                .done(function (response) {
                    $(".toast-body").html(JSON.parse(response));
                    $('.toast').removeClass("d-none");
                    $('.toast').toast('show');
                    $('.spinner-border').addClass("d-none");
                    $("#contact-btn").prop("disabled", true);
                    check_grecaptcha();
                    setTimeout(function () {
                        $("#contact-btn").prop("disabled", false);
                        $("form").trigger("reset");
                        $("form").each(function () {
                            $(this).find('.form-group').removeClass("has-success")
                        })
                    }, 3000);
                })
                .fail(function (response) {
                    $(".toast-body").html(JSON.parse(response));
                    $('.toast').toast('show');
                    $('.spinner-border').addClass("d-none");
                });
        }
    });
});