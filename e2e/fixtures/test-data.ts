/**
 * Shared test data constants.
 *
 * SEED USERS (created by DataSeeder when backend runs with "dev" profile):
 *   alice / Password1!
 *   bob   / Password1!
 *   carol / Password1!
 *   dave  / Password1!
 *   eve   / Password1!
 *
 * NEW_USER is created at runtime by individual tests that need a fresh account.
 */

export const SEED = {
  alice: { username: 'alice', email: 'alice@demo.com', password: 'Password1!', displayName: 'Alice Wonderland' },
  bob:   { username: 'bob',   email: 'bob@demo.com',   password: 'Password1!', displayName: 'Bob Builder'      },
  carol: { username: 'carol', email: 'carol@demo.com', password: 'Password1!', displayName: 'Carol Danvers'    },
  dave:  { username: 'dave',  email: 'dave@demo.com',  password: 'Password1!', displayName: 'Dave Grohl'       },
  eve:   { username: 'eve',   email: 'eve@demo.com',   password: 'Password1!', displayName: 'Eve Online'       },
} as const;

/** A unique-per-run user that tests can register during the test. */
export function newUser(suffix?: string) {
  const ts = Date.now();
  const tag = suffix ?? ts;
  return {
    username:    `testuser_${tag}`,
    email:       `testuser_${tag}@playwright.test`,
    password:    'Password1!',
    displayName: `Test User ${tag}`,
  };
}

export const INVALID = {
  shortPassword:  'abc',
  longBio:        'a'.repeat(201),
  emptyString:    '',
  badEmail:       'not-an-email',
  longUsername:   'a'.repeat(31),
  specialUsername:'user name!',
  nonExistentUser:'nobody_xyz_99999',
} as const;

export const SAMPLE_POSTS = {
  public:        { content: 'Hello world! #e2etest #public',       privacy: 'PUBLIC'          },
  followersOnly: { content: 'Followers only post #e2etest',        privacy: 'FOLLOWERS_ONLY'  },
  privatePost:   { content: 'Private post #e2etest',               privacy: 'PRIVATE'         },
  withHashtag:   { content: 'Testing hashtags #playwright #e2etest', privacy: 'PUBLIC'        },
} as const;
