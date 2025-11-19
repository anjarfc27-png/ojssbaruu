import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkData() {
  console.log('=== CHECKING DATABASE DATA ===');
  
  // 1. Get admin user ID
  console.log('\n1. Getting admin user...');
  const { data: adminUser, error: adminError } = await supabase
    .from('users')
    .select('id, username, email')
    .eq('email', 'admin@example.com')
    .single();
    
  if (adminError) {
    console.error('Error getting admin user:', adminError);
    return;
  }
  
  console.log('Admin user:', adminUser);
  
  // 2. Check user_user_groups for admin
  console.log('\n2. Checking user_user_groups for admin...');
  const { data: userGroups, error: userGroupsError } = await supabase
    .from('user_user_groups')
    .select('*')
    .eq('user_id', adminUser.id);
    
  if (userGroupsError) {
    console.error('Error getting user_user_groups:', userGroupsError);
  } else {
    console.log('User groups for admin:', userGroups);
  }
  
  // 3. Check all user_user_groups (first 10)
  console.log('\n3. Checking all user_user_groups (first 10)...');
  const { data: allUserGroups, error: allError } = await supabase
    .from('user_user_groups')
    .select('*')
    .limit(10);
    
  if (allError) {
    console.error('Error getting all user_user_groups:', allError);
  } else {
    console.log('All user_user_groups sample:', allUserGroups);
  }
  
  // 4. Check user_groups
  console.log('\n4. Checking user_groups...');
  const { data: userGroupsTable, error: groupsError } = await supabase
    .from('user_groups')
    .select('*')
    .limit(5);
    
  if (groupsError) {
    console.error('Error getting user_groups:', groupsError);
  } else {
    console.log('User groups table sample:', userGroupsTable);
  }
  
  console.log('\n=== CHECK COMPLETE ===');
}

checkData().catch(console.error);