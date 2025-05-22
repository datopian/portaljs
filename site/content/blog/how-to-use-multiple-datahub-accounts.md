---
title: How to use multiple DataHub accounts
created: 2018-07-18
authors: ['anuveyatsu']
---

If you are using `data` CLI tool for both personal and professional purposes, you would need to have more than 1 account. Below we explain how account configurations work and how you can manage them - it is simple and straightforward!

## Accounts and config files

You have config file per account, which is stored in `~/.config/datahub/` directory. By default, its name is `config.json` - try to 'cat' it to have a sense about how it looks like:

```bash
cat ~/.config/datahub/config.json
```

and you'd get following output:

```json
{
    "token": "your-token",
    "profile": {
        "avatar_url": "...",
        "email": "...",
        "id": "...",
        "join_date": "...",
        "name": "...",
        "provider_id": "...",
        "username": "..."
    }
}
```

If you have multiple accounts, it is suggested to store config files in the same location so you always can list and quickly find them. For example, you can rename your personal config file to `my.json`, while your organization account configs would have `org.json` name. If you list files in your configs directory:

```bash
ls ~/.config/datahub/
```

you'd get:

```bash
my.json    org.json
```

## Switch between your accounts

Once you have all config files locally with appropriate names, it is easy to switch between them. It can be done by setting `DATAHUB_JSON` environment variable. The CLI tool will use value of this variable to authenticate you in the system. Simply set it up for the current session, e.g., let's use your org account:

```bash
export DATAHUB_JSON=~/.config/datahub/org.json
```

## Check current account

Although the `data` CLI tool doesn't have a command for checking which account you're using, you can print current value of your `DATAHUB_JSON` variable:

```bash
echo $DATAHUB_JSON
```

---

*Originally published at https://datahub.io/docs/tutorials/how-to-use-multiple-datahub-accounts*
