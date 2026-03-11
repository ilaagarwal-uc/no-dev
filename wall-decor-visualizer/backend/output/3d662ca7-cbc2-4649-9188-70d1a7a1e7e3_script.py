OUTPUT_PATH = '/tmp/3d662ca7-cbc2-4649-9188-70d1a7a1e7e3.glb'

import bpy

def create_wall_skeleton():
    """
    Reconstructs the wall skeleton based on the provided image dimensions:
    - Total Wall Height: 9'
    - Total Wall Width: 14'6" (7' opening + 7'6" solid wall)
    - Opening Width: 7'
    - Opening Height: 8'
    - Gap above opening: 1'
    """
    # Clear existing objects in the scene
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete()

    # Dimensions in feet (1 unit = 1 foot)
    wall_width = 14.5  # 7' + 7.5'
    wall_height = 9.0
    wall_depth = 0.5   # Standard wall thickness
    
    opening_width = 7.0
    opening_height = 8.0
    
    # 1. Create the Main Wall
    # Create a cube and transform it to match wall dimensions
    bpy.ops.mesh.primitive_cube_add(size=1)
    wall = bpy.context.active_object
    wall.name = "Main_Wall"
    
    # Set scale (dimensions)
    wall.scale = (wall_width, wall_depth, wall_height)
    # Position so the bottom-left corner is at the origin (0,0,0)
    wall.location = (wall_width / 2, wall_depth / 2, wall_height / 2)
    
    # Apply transformations
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)

    # 2. Create the Opening (Cutter for Boolean)
    bpy.ops.mesh.primitive_cube_add(size=1)
    cutter = bpy.context.active_object
    cutter.name = "Opening_Cutter"
    
    # Scale the cutter (slightly deeper than the wall for a clean cut)
    cutter.scale = (opening_width, wall_depth * 2, opening_height)
    # Position at the left side (x=0 to 7) and bottom (z=0 to 8)
    cutter.location = (opening_width / 2, wall_depth / 2, opening_height / 2)
    
    # Apply transformations
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)

    # 3. Perform Boolean Operation
    # Add boolean modifier to the wall
    bool_mod = wall.modifiers.new(name="Wall_Opening", type='BOOLEAN')
    bool_mod.object = cutter
    bool_mod.operation = 'DIFFERENCE'
    
    # Apply the modifier
    bpy.context.view_layer.objects.active = wall
    bpy.ops.object.modifier_apply(modifier=bool_mod.name)

    # 4. Cleanup: Remove the cutter object
    bpy.data.objects.remove(cutter, do_unlink=True)

    # 5. Export to GLB
    # use_selection=False ensures the whole scene is exported
    bpy.ops.export_scene.gltf(
        filepath='/tmp/3d662ca7-cbc2-4649-9188-70d1a7a1e7e3.glb', 
        export_format='GLB', 
        use_selection=False
    )

# Execute the function directly
create_wall_skeleton()