# Lexical Playground Payload 2.X Integration Demo

## What This Project Is and What It Is Not

I've spent some time porting Lexical [Playground](https://playground.lexical.dev/) features to Payload 2.x. Currently, the project supports only Payload *version 2.x* (updated to 2.25.0).

Porting to version 3.0 \<u>is not on the radar at this time\</u>, but it may be considered once it is marked as stable.

I hope that the outstanding and helpful community of Payload CMS will help fix bugs and perhaps even port the features to Payload version 3.0. I'm not a professional developer, so my code has many bugs and unconventional or even incorrect approaches to project structure and code writing. Therefore, it will be up to you, the end user, to fix bugs and issues that may arise while using this project. Feel free to report them in this repo; I will try to find enough spare time to keep this project going because I also need the Playground features for my customers as a freelance developer.

Currently, the ported features are deeply integrated into a dummy website built using the Payload 2.X custom server example. [Link to custom server example](https://github.com/payloadcms/payload/tree/main/examples/custom-server). I believe it is possible to "untie" the ported editor from the small project I've built, but it will require time and effort. For now, the priority is bug fixing, with future plans to port it to Payload 3.0.

The Lexical editor in Payload version 2.X is fixed to version **0.13.1**, which, of course, includes bugs that have been fixed in later versions. Changing the Lexical version (or even some of its dependencies) will cause the editor to fail, so try to avoid it. The code written here modifies some of the Playground feature nodes directly, which will be a problem when trying to update Lexical dependencies. The only way to mitigate this for now is to build a custom editor from Payload 2.X source code using [AlessioGr's](https://github.com/payloadcms/payload/commits?author=AlessioGr) custom-written code to integrate Lexical into Payload without needing to rebuild your project every time you make changes to the editor. Of course, there's another option: using custom fields (Alessio's Lexical uses it too, but it was customized so that you can integrate Lexical features as a Payload config, which is a great productivity boost) that will help you integrate the latest Lexical editor (and almost any React editor out there) into your project. You can read more about this in the Payload docs [link](https://payloadcms.com/docs/admin/components#fields).

Huge thanks to **AlessioGr** and the Payload CMS team for their work! I hope that when 3.X is marked stable, they will have more time to continue this great work of improving the editing experience in Payload CMS and porting new features. In time, there may not even be a need for this project to exist. As of now, Payload 3.0 already supports toolbars and includes a ported version (latest one) of table features. Great job!

### Supported and Ported Features (To Some Extent)

1. **Actions**
   * Clearing editor state
   * Import / Export editor state
   * Speech to text
2. Collapsible container
3. Comments\* (this feature relies on a hidden comments collection inside Payload to store, retrieve, and delete comments; it is not production-ready, like most of these features)
4. Context menu
5. Drag and drop files into the editor\* (this feature has a bug where you can't drop an image onto the editor; for some reason unknown to me, something blocks registering drag & drop events, but copying files from local folders using CTRL + C and CTRL + V works fine; copying files from the web should also work but has issues with name collisions)
6. Image gallery (custom-built by me for frontend use)
7. Images (not inline)
8. Layout
9. Table, table action menu, table cell resizer
10. Text styles: background color, text color, clearing text formatting
11. Toolbar
12. YouTube insert
13. Auto image upload\*

The project supports two ways of using editor state in your frontend:

1. Using raw HTML output from the editor (via HTML converters feature)
2. Parsing editor state in the frontend and outputting React components (see an example on how to parse Lexical JSON in `/path_to_your_cloned_project/src/components/richText`). I use ShadCN components, but you can customize them to suit your UI library (custom one, MUI, etc.)

The project carries over all known and unknown bugs of the Lexical Playground editor from version 0.13.1, plus any I may have introduced. It uses Next.js 14 under the hood and a PostgreSQL database. Initially, I used Payload's local API, and when I tried to build my project with statically generated pages (using tags and Payload hooks to regenerate pages when data in Payload changes), I encountered issues: the database connection kept crashing because too many connections were opened and not closed properly by Payload. I eventually abandoned the idea of using the Payload local API with Next.js `unstable_cache` and PostgreSQL (MongoDB did not have the aforementioned issues) and instead started using the REST API. If you're curious about my struggles, you can read more on [Discord](https://discord.com/channels/967097582721572934/1241524081350803466/1241524081350803466 "link").

For now, it is not production-ready: the styling is inconsistent, features have major bugs, and some can even break the editor state altogether. However, I hope you will find this to be a simple reference on how to create your custom features or port existing ones and improve upon them. I'll try to find more time to expand these docs and create more in-depth guides on how to create new features and port existing ones for you to better understand how Lexical works under the hood and what you can do with it (spoiler: A LOT). But given that I'm not a professional developer, you should be able to rewrite some of my code to better suit your needs and integrate it into your project. Thank you!

## Requirements

* Node.js 16+
* Yarn package manager
* Docker and Docker Compose installed

## Installation

1. Clone the repository: `git clone REPOSITORY`
2. Install dependencies: `yarn install`
3. Start the database: `docker-compose -f docker-compose.dev.database.yaml up -d` (alternatively, you can set up the database without Docker and provide the connection string in the `.env` file)

## Seeding

There are two ways to set up the project database:

1. I have dummy data backed up inside the `./backups` folder. You can restore it by running the `restore.sh` script (grant execution permissions) inside the `./scripts` folder. It accepts one argument - the path to the dumped SQL file.
   Run `./scripts/restore ./backups/FILENAME.sql` and it will restore the database dump.
   Alternatively, you can run in your shell/terminal:
   bash
   Copy code
   `docker exec` -i lexical\_test psql -U admin -d payload \< FILENAME.sql

   Replace `FILENAME.sql` with the database dump found in the `./backups` folder.
2. Seeding the database using the `/api/seed` custom route.

Navigate to `/src/payload.config.ts` and open the Payload configuration. Then uncomment these lines (they are commented out because the build fails due to TypeScript type mismatches, which need fixing):

`import { seed } from './payload/endpoints/seed'`


and

`endpoints`: \[
&#x20; {
`    handler`: seed,
`    method: 'get'`,
`    path: '/seed'`,
&#x20; }
],


Now, using curl, wget, Postman, or any other tool, call this route when the project starts. I'll use Postman as an example. Ensure the project dependencies are installed and the dev server is running (`yarn dev`).

Open Postman and create a new GET request to the following URL: `localhost:3000/api/seed`.
Then open the Authorization tab and set the following settings:

1. **Type:** API Key
2. **Key:** Authorization
3. **Value:** `users API-Key c92aa14f-fef6-4fd6-be6a-97e6c0402ca4` (replace with your users collection name and API Key found in `.env` under `USER_API_KEY` or `API_SECRET`)
4. **Add to:** Header

Alternatively, you can append this data as a header.

Now send the request to the running project. It should take some time, and you will see a bunch of outputs to the server console. The seed is successful when you see the message **'Seeded database successfully!'** and a "success: true" response from the server.

Now that the database is seeded properly, you can navigate to the frontend at `localhost:3000` and the admin panel at `localhost:3000/admin` to explore it.

**User credentials to log in to the admin panel:**

Email: [test@test.com](mailto\:test@test.com)
Password: test

## Custom Editor (in Future)

## Creating Custom Features (in Future)

## Porting Existing Features to Payload (in Future)